const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {onDocumentCreated, onDocumentUpdated} = require('firebase-functions/v2/firestore')
// const {createStripeCustomer, createStripeAccountLink, toStripeCustomerFields} = require('./utils')
const {defineSecret} = require('firebase-functions/params');
admin.initializeApp();
const db = admin.firestore();
const client = new admin.firestore.v1.FirestoreAdminClient();

const stripeKey = defineSecret('STRIPE_KEY');
const stripe = require('stripe')("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");

//this should be refactored. save the drivers under the org document with key matching auth uid, then
//query the users based on the org doc rather than querying the entire authentication database
exports.listUsers = onCall((request) => {
  const {role, organization} = request.auth.token;
  const results = [];
  return admin.auth().listUsers()
      .then((userList) => {
        functions.logger.log(userList)
        userList.users.forEach((user) => {
          if ((user?.customClaims?.organization === organization) &&
          (role === 'Admin')) {
            functions.logger.log(user);
            results.push(user);
          }
        });
        functions.logger.log(results);
        return results;
      })
      .catch((err) => {
        functions.logger.log(err)
        throw new HttpsError('internal', 'couldn\'t list users', err);
      });
});

exports.createOrg = onCall((request) => {
  const {orgName} = request.data;
  if (orgName === '') {
    throw new HttpsError('failed-precondition', 'Include organization name');
  } else {
    return admin.firestore().collection('organizations').add({...request.data})
      .then((doc) => {
        const customClaims = {
          organization: doc.id,
          role: 'Admin',
        };
        return admin.auth()
          .setCustomUserClaims(request.auth.token.uid, customClaims)
          .then(() => {
            return request.auth;
          })
          .catch((err) => {
            functions.logger.log(err);
          });
      })
      .catch((e) => {
        functions.logger.log(e);
      });
  }
});

//probably temporary as this isn't the usual flow
exports.createStripeCustomer = onCall(async (request) => {
  const {customer, stripeAccount} = request.data
  const {role, organization} = request.auth.token
  if (role !== "Admin") {
    throw new HttpsError('failed-precondition', 'Insufficient permissions');
  }
  createStripeCustomer({...customer, cust_email: customer.cust_email.trim()}, organization, db, stripe, stripeAccount)   //ADD STRIPE CONNECTED ACCOUNT ID
})

const toHRDateFormat = (time) => {
  return new Date(time.seconds * 1000).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})
}

// take an array of service events, 
// generate invoices from them, and send them to Stripe
// then set the "added to invoice" flag on the service logs entry
exports.createInvoiceItems = onCall(async (request) => {
  const {logsArray} = request.data;  
  const {organization, role} = request.auth.token
  const doc = await db.collection('organizations').doc(organization).get()
  const org = doc.data()
  if (role !== "Admin") {
    throw new HttpsError('failed-precondition', 'Insufficient permissions');
  }
  let promises = []
  // Generate invoices from logs array
  logsArray.forEach(async(entry, i) => {
    setTimeout(async() => {
      const invoiceItem = await stripe.invoiceItems.create({
        customer: entry.stripeID,
        amount: entry.price * 100,
        currency: "usd",
        description: `${entry.description}`,
        metadata: {
          date: entry.date,
          service_address: entry.service_address,
          work_type: entry.work_type,
        }
      }, {
        stripeAccount: org.stripe_account_id
      });
      // update service log with invoice item id
      const logRef = db.collection(`organizations/${organization}/service_logs`).doc(entry.id)
      promises.push(logRef.update({invoice_item_id: invoiceItem.id}))   
    }, i*20)     
  });
  return Promise.all(promises).then(res => {
    functions.logger.log(res)
    return res
    }).catch(err => {
      functions.logger.log(err)
      throw new HttpsError('Error', 'error creating invoices: ', err)
    })
})

exports.getPendingBalances = onCall(async (request) => {
  const {role, organization} = request.auth.token
  if (role !== "Admin") {
    throw new HttpsError('failed-precondition', 'Insufficient permissions');
  }
  const stripeAccount = await getStripeAccount(organization)

  // Get all pending invoice items for the organization
  const pendingInvoiceItems = []
  let hasMore = true
  let startingAfter = undefined

  while (hasMore) {
    const invoiceItems = await stripe.invoiceItems.list({
      pending: true,
      limit: 100,
      starting_after: startingAfter
    }, {
      stripeAccount: stripeAccount
    });
    functions.logger.log(invoiceItems)
    pendingInvoiceItems.push(...invoiceItems.data)  
    startingAfter = invoiceItems.data[invoiceItems.data.length - 1].id
    hasMore = invoiceItems.has_more
  }


  // Get all customers from that organization's customer collection in firebase
  const customersRef = db.collection(`organizations/${organization}/customers`)
  const custSnapshot = await customersRef.get()

  const balances = []

  // Calculate balances for each customer
  custSnapshot.forEach((doc) => {
    const customer = {...doc.data(), id: doc.id}
    const customerInvoiceItems = pendingInvoiceItems.filter(item => item.customer === customer.stripeID)
    const balance = customerInvoiceItems.reduce((acc, item) => acc + item.amount, 0)
    if (balance > 0) {
      functions.logger.log(`${customer.cust_name}`, balance)

      balances.push({stripeID: customer.stripeID, cust_name: customer.cust_name, address: customer.bill_address, balance: balance, email: customer.cust_email})
    }    
  })
  return balances
})


exports.sendInvoices = onCall(async (request) => {
  const {customers, dueDate} = request.data
  const {role, organization} = request.auth.token
  if (role !== "Admin") {
    throw new HttpsError('failed-precondition', 'Insufficient permissions');
  }
  const stripeAccount = await getStripeAccount(organization)
  let promises = []

  const createAndSendInvoice = async (customer) => {
    setTimeout(async() => {
      const invoice = await stripe.invoices.create({
        customer: customer,
        due_date: dueDate,
        pending_invoice_items_behavior: "include",
        collection_method: 'send_invoice',
      },
      {
        stripeAccount: stripeAccount
      })
      promises.push(stripe.invoices.sendInvoice(invoice.id,
        {
          stripeAccount: stripeAccount
        }))
    }, 20)
  }
  // create invoices for each customer
  customers.forEach(async (customer, i) => {
    delay(i*20).then(() => {      
      promises.push(createAndSendInvoice(customer))
    })
  })
  return Promise.all(promises)
  .then(async(res) => {
    return res
  })
  .catch(err => {
    functions.logger.log(err)
    throw new HttpsError('Error', 'error creating invoices: ', err)
  })
})

exports.createUser = onCall((request) => {
  const {displayName, email, customClaims, disabled} = request.data;
  customClaims['organization'] = request.auth.token.organization;
  const role = request.auth.token.role;
  // assign organization based on context.token
  if (!request.auth) {
    // Throwing an HttpsError if not logged in
    throw new HttpsError('failed-precondition', 'Not authenticated.');
  } else if (role !== 'Admin') {
    // Throwing an HttpsError if not Admin
    throw new HttpsError('failed-precondition', 'Insufficient permissions');
  } else {
    return admin.auth().createUser({
      email: email,
      displayName: displayName,
      disabled: disabled,
    })
        .then((userRecord) => {
          return admin.auth().setCustomUserClaims(userRecord.uid, customClaims)
              .then(() => {
                return admin.auth().getUser(userRecord.uid);
              })
              .catch((err) => {
                return err;
              });
        })
        .catch((err) => {
          return err;
        });
  }
});

exports.updateUser = onCall((request) => {
  const {uid, displayName, email, customClaims, disabled} = request.data;
  const organization = request.auth.token.organization;
  const role = request.auth.token.role;
  if (!request.auth) {
    // Throwing an HttpsError if not logged in
    throw new HttpsError('failed-precondition', 'Not authenticated.');
  } else if (role !== 'Admin') {
    // Throwing an HttpsError if not Admin
    throw new HttpsError('failed-precondition', 'Insufficient permissions');
  } else {
    return admin.auth().getUser(uid).then((userRecord) => {
      if (userRecord.customClaims.organization === organization) {
        return admin.auth().updateUser(uid, {
          email: email,
          displayName: displayName,
          disabled: disabled,
        })
            .then((result) => {
              return admin.auth().setCustomUserClaims(result.uid, customClaims)
                  .then(() => {
                    return admin.auth().getUser(result.uid);
                  });
            }).catch((err) => {
              throw new HttpsError('unknown', err);
            });
      } else functions.logger.log('wrong organization');
    });
  }
});

exports.deleteUser = onCall((request) => {
  const {uid, displayName, customClaims} = request.data;
  const {organization, role} = request.auth.token;
  functions.logger.log(`attempting to delete ${displayName}`);
  if (!request.auth) {
    // Throwing an HttpsError if not logged in
    throw new HttpsError('failed-precondition', 'Not authenticated.');
  } else if ((role !== 'Admin') ||
    (organization !== customClaims.organization)) {
    // Throwing an HttpsError if not Admin
    throw new HttpsError('failed-precondition', 'Insufficient permissions');
  } else {
    functions.logger.log(`deleting ${displayName}`);
    return admin.auth().deleteUser(uid)
        .then((response) => {
          return response;
        })
        .catch((err) => {
          return err;
        });
  }
});

exports.scheduledBackup = functions.pubsub
    .schedule('0 0 * * *')
    .onRun(() => {
      const projectId = process.env.GCLOUD_PROJECT;
      const databaseName = client.databasePath(projectId, '(default)');
      return client.exportDocuments({
        name: databaseName,
        outputUriPrefix: process.env.BUCKET,
        collectionIds: [],
      })
          .then((responses) => {
            const response = responses[0];
            console.log(`Operation Name: ${response['name']}`);
          })
          .catch((err) => {
            console.error(err);
            throw new Error('Export operation failed');
          });
    });

exports.updateLogEntry = functions.firestore
    .document('organizations/{organization}/service_logs/{itemID}')
    .onUpdate((change, context) => {
      const organization = context.params.organization;
      const {timestamp} = context;
      const {itemID} = context.params;
      return admin.firestore()
          .collection(`organizations/${organization}/audit_logs`).add({
            log_id: itemID,
            cust_id: change.before.id,
            timestamp: new Date(timestamp),
            before: change.before.data(),
            after: change.after.data(),
          })
          .then(async(doc) => {
            if (change.before.data().invoice_item_id) {
              const stripeAccount = await getStripeAccount(organization)
              return stripe.invoiceItems.update(
                change.before.data().invoice_item_id,
                {
                  amount: change.after.data().price * 100,
                  description: change.after.data().description,                  
                },
                {
                  stripeAccount: stripeAccount
                }
              )
              .then((invoice) => {
                return invoice
              })
            }
            return doc;
          })
          .catch((e) => {
            return e;
          });
    });

exports.deleteLogEntry = functions.firestore
  .document(`organizations/{organization}/service_logs/{itemID}`)
  .onDelete((snap, context) => {
    const { organization, itemID } = context.params;
    const record = snap.data();
    const { timestamp } = context;
    return admin.firestore()
      .collection(`organizations/${organization}/audit_logs`).add({
        log_id: itemID,
        cust_id: record.cust_id,
        timestamp: new Date(timestamp),
        deleted: record,
      })
      .then(async(doc) => {
        if (record.invoice_item_id) {
          const stripeAccount = await getStripeAccount(organization)
          return stripe.invoiceItems.del(
            record.invoice_item_id,
            {
              stripeAccount: stripeAccount
            }
          )
          .then((invoice) => {
            return invoice
          })
        }
        return doc;
      })
      .catch((e) => {
        return e;
      });
});

exports.createCustomer = onDocumentCreated('organizations/{organization}/customers/{itemID}', async(event) => {
  const {itemID, organization} = event.params
  const customer = {...event.data.data(), id: itemID}
  const doc = await db.collection('organizations').doc(organization).get()
  const org = doc.data()  
  functions.logger.log("org: ", org)
  if (org.stripe_account_id) {
    createStripeCustomer(customer, event.params.organization, db, stripe, org.stripe_account_id)
  }
})

exports.updateCustomer = onDocumentUpdated('organizations/{organization}/customers/{itemID}', async (event) => {
  const {itemID, organization} = event.params
  const customer = {...event.data.after.data(), id: itemID}
  const doc = await db.collection('organizations').doc(organization).get()
  const org = doc.data() 
  if (org.stripe_account_id) { 
    if (customer.cust_email && !customer.stripeID) {
      createStripeCustomer(customer, event.params.organization, db, stripe, org.stripe_account_id)
    }
    else if (customer.stripeID) {
      await stripe.customers.update(
        customer.stripeID,
        toStripeCustomerFields(customer),
        {
          stripeAccount: org.stripe_account_id
        }
      )
    }
  }
})

exports.writeCustomer = functions.firestore
    .document('organizations/{organization}/customers/{itemID}')
    .onWrite((change, context) => {
      const organization = context.params.organization;
      const {timestamp} = context;
      const {itemID} = context.params;
      return admin.firestore()
          .collection(`organizations/${organization}/audit_customers`).add({
            cust_id: itemID,
            timestamp: new Date(timestamp),
            before: change.before.data() || null,
            after: change.after.data() || null,
          })
          .then((doc) => {
            return doc;
          })
          .catch((e) => {
            return e;
          });
    });

    exports.writeServiceLocation = functions.firestore
    .document('organizations/{organization}/service_locations/{itemID}')
    .onWrite((change, context) => {
      const organization = context.params.organization;
      const {timestamp} = context;
      const {itemID} = context.params;
      return admin.firestore()
          .collection(`organizations/${organization}/audit_customers`).add({
            cust_id: itemID,
            timestamp: new Date(timestamp),
            before: change.before.data() || null,
            after: change.after.data() || null,
          })
          .then((doc) => {
            return doc;
          })
          .catch((e) => {
            return e;
          });
    });

// Call this when creating a new stripe account
exports.createStripeConnectedAccount = onCall(async(request) => {
  functions.logger.log(request)
  const {organization, email} = request.auth.token
  functions.logger.log("organization: ", organization)
  const {orgName} = request.data
  try {
    const account = await stripe.accounts.create({
      type: 'standard',
      email: email,
      business_profile: {
        name: orgName,
      }
    })
    await db.collection('organizations').doc(organization).update({
      stripe_account_id: account.id,
    })
    const custsRef = db.collection(`organizations/${organization}/customers`)
    const custsSnapshot = await custsRef.get()
    let promises = []

    custsSnapshot.forEach((cust, i) => {
      functions.logger.log(cust.data())
      delay(i*20).then(() => {
        promises.push(createStripeCustomer({...cust.data(), id: cust.id}, organization, db, stripe, account.id))
      });
    })
    return Promise.all(promises).then(() => {
      return createStripeAccountLink(account.id, stripe)
    })   
  }
  catch (err) {
    throw new HttpsError('unknown', err);
  }
});

// Call this when getting an account link for existing account
exports.getAccountLink = onCall((request) => {
  // get stripe account id from organization document
  const {organization} = request.auth.token;
  const organizationRef = admin.firestore()
      .collection('organizations').doc(organization);
  return organizationRef.get()
      .then((org) => {
        return createStripeAccountLink(org.stripe_account_id, stripe);
      })
      .then((accountLink) => {
        return accountLink.url;
      })
      .catch((err) => {
        throw new HttpsError('unknown', 'Failed to generate account link');
      });
});

exports.connectLogsToCust = onCall(async request => {
  const organization = request.auth.token.organization
  const role = request.auth.token.role
  if (!request.auth) {
    // Throwing an HttpsError if not logged in
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  } else if (role !== 'Admin') {
    // Throwing an HttpsError if not Admin
    throw new functions.https.HttpsError('failed-precondition', 'Insufficient permissions');
  } else {
    const customersRef = admin.firestore().collection(`organizations/${organization}/service_locations`)
    const logsRef = admin.firestore().collection(`organizations/${organization}/service_logs`)
    const logsSnapshot = await logsRef.get()
    logsSnapshot.forEach(async (result) => {
      const entry = {...result.data(), id: result.id}
      if (entry.cust_id) return
      let cust_id = ""
      const custSnapshot = await customersRef
        .where("cust_name", "==", entry.cust_name)
        .where("service_address", "==", entry.service_address)
        .get()
      if (custSnapshot.exists()) {
        // set logEntry.cust_id to the id of the found customer          
        custSnapshot.forEach(customer => cust_id = customer.id)
      }        
      return logsRef.doc(entry.id).set({cust_id: cust_id}, {merge: true})
    })
  }
})

// exports.publicCreateStripeCustomer = onCall(async(request) => {
//   const {organization, email} = request.auth.token
//   const {orgName} = request.data

const createStripeCustomer = async (customer, organization, db, stripe, stripeAccount) => {
  //functions.logger.log(toStripeCustomerFields(customer))
  const stripeCustomer = await stripe.customers.create(toStripeCustomerFields(customer), {stripeAccount: stripeAccount});
  const custRef = db.collection(`organizations/${organization}/customers`).doc(customer.id)
  await custRef.update({stripeID: stripeCustomer.id})
  return stripeCustomer
 //The following line works
  // functions.logger.log(stripeCustomer.id)
  // const logsRef = db.collection(`organizations/${organization}/service_logs`)
  // const snapshot = await logsRef.where('cust_id', '==', customer.id).get()
  // let promises = []
  // if (!snapshot.empty) {
  //   snapshot.forEach((doc, i) => {
  //     // the following line doesn't work
  //     functions.logger.log("path: ", doc.ref.path) 
  //     delay(i*20).then(() =>           
  //       promises.push(db.doc(doc.ref.path).update({stripeID: stripeCustomer.id}))
  //     );
  //   });
  // }
  // return Promise.all(promises).then(async() => {
  //   const custRef = db.collection(`organizations/${organization}/customers`).doc(customer.id)
  //   await custRef.update({stripeID: stripeCustomer.id})
  //   return stripeCustomer
  // }).catch(err => {functions.logger.log(err)})
}

const createStripeAccountLink = (accountId, stripe) => {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: 'https://routeworks.app', // have front end retrigger link creation and direct to onboarding flow
    return_url: 'https://routeworks.app', // this is after successfully existing. check on front end for completed account
    type: 'account_onboarding',
  }).then((accountLink) => {
    return accountLink;
  }).catch((err) => {
    throw new HttpsError('unknown', 'Failed to generate account link');
  });
};

const toStripeCustomerFields = (customer) => {
  return (
    {
      email: customer?.cust_email || "",
      name: customer?.cust_name || "",
      // phone: customer?.cust_phone || "",
      address: {
        line1: customer?.bill_address || "",
        city: customer?.bill_city || "",
        state: customer?.bill_state || "",
        postal_code: customer?.bill_zip || ""
      }
    }
  )
}

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// function to get the stripe account id from the organization document
const getStripeAccount = async (organization) => {
  const doc = await db.collection('organizations').doc(organization).get()
  const org = doc.data()
  return org.stripe_account_id
}
