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
exports.createStripeCustomers = onCall(async (request) => {
  const {customers, stripeAccount} = request.data
  const {role, organization} = request.auth.token
  if (role !== "Admin") {
    throw new HttpsError('failed-precondition', 'Insufficient permissions');
  }
  let promises = []
  customers.forEach(async (customer, i) => {
    if (!customer.stripeID) {
      setTimeout(promises.push(createStripeCustomer(customer, organization, db, stripe, stripeAccount)), i*30)
         //ADD STRIPE CONNECTED ACCOUNT ID
    }
  })
  return Promise.all(promises)
})

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
  logsArray.forEach(async(entry) => {

    const invoiceItem = await stripe.invoiceItems.create({
      customer: entry.stripeID,
      amount: entry.price * 100,
      currency: "usd",
      description: entry.description,
    }, {
      stripeAccount: org.stripe_account_id
    });
    // update service log with invoice item id
    const logRef = db.collection(`organizations/${organization}/service_logs`).doc(entry.id)
    promises.push(logRef.update({invoice_item_id: invoiceItem.id}))    
  });
  return Promise.all(promises)
})

exports.getPendingBalances = onCall(async (request) => {
  const {role, organization} = request.auth.token
  let balancePromises = []
  if (role !== "Admin") {
    throw new HttpsError('failed-precondition', 'Insufficient permissions');
  }
  // get stripe_account_id from organization document
  const doc = await db.collection('organizations').doc(organization).get()
  const org = doc.data()
  const stripeAccount = org.stripe_account_id
  // Get all customers from that organization's customer collection in firebase
  const customersRef = db.collection(`organizations/${organization}/customer`)
  const custSnapshot = await customersRef.get()

  // get balances for each customer
  const getBalance = (customer) => {
    return stripe.invoiceItems.list({
      customer: customer.stripeID,
      pending: true,
    }, {
      stripeAccount: stripeAccount
    })
    .then(res => {
      const balance = res.data.reduce((acc, item) => acc + item.amount, 0)
      return {stripeID: customer.stripeID, cust_name: customer.cust_name, address: customer.service_address, balance: balance}
    })
    .catch(err => {return err})
  }

  custSnapshot.forEach(async(doc) => {
    const customer = {...doc.data(), id: doc.id}  
    balancePromises.push(getBalance(customer))
  })
  return Promise.all(balancePromises)
  .then((balances) => {
    return balances.filter(b => b.balance > 0)
  })
  .catch(err => {
    functions.logger.log("error: ", err)
    throw new HttpsError('Error', 'error creating invoices: ', err)
  })
})


exports.sendInvoices = onCall(async (request) => {
  const {customers, dueDate} = request.data
  const {role, organization} = request.auth.token
  if (role !== "Admin") {
    throw new HttpsError('failed-precondition', 'Insufficient permissions');
  }
  // get stripe_account_id from organization document
  const doc = await db.collection('organizations').doc(organization).get()
  const org = doc.data()
  const stripeAccount = org.stripe_account_id
  let promises = []

  const createAndSendInvoice = async (customer) => {
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
  }
  // create invoices for each customer
  customers.forEach(async (customer) => {
    promises.push(createAndSendInvoice(customer))
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
          .then((doc) => {
            return doc;
          })
          .catch((e) => {
            return e;
          });
    });

exports.deleteLogEntry = functions.firestore
  .document(`organizations/{organization}/service_logs/{itemID}`)
  .onDelete((snap, context) => {
      const organization = context.params.organization;
      const record = snap.data();
      const {timestamp} = context;
      const {itemID} = context.params;
      return admin.firestore()
          .collection(`organizations/${organization}/audit_logs`).add({
            log_id: itemID,
            cust_id: record.cust_id,
            timestamp: new Date(timestamp),
            deleted: record,
          })
          .then((doc) => {
            return doc;
          })
          .catch((e) => {
            return e;
          });
});

exports.createCustomer = onDocumentCreated('organizations/{organization}/customer/{itemID}', async(event) => {
  const {itemID, organization} = event.params
  const customer = {...event.data.data(), id: itemID}
  const doc = await db.collection('organizations').doc(organization).get()
  const org = doc.data()  
  functions.logger.log("org: ", org)
  if (org.stripe_account_id) {
    createStripeCustomer(customer, event.params.organization, db, stripe, org.stripe_account_id)
  }
})

exports.updateCustomer = onDocumentUpdated('organizations/{organization}/customer/{itemID}', async (event) => {
  const {itemID, organization} = event.params
  const customer = {...event.data.after.data(), id: itemID}
  const doc = await db.collection('organizations').doc(organization).get()
  const org = doc.data() 
  if (org.stripe_account_id) { 
    await stripe.customers.update(
      customer.stripeID,
      toStripeCustomerFields(customer)
    )
  }
})

exports.writeCustomer = functions.firestore
    .document('organizations/{organization}/customer/{itemID}')
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
    const custsRef = db.collection(`organizations/${organization}/customer`)
    const custsSnapshot = await custsRef.get()
    let promises = []
    custsSnapshot.forEach((cust, i) => {
      setTimeout(promises.push(createStripeCustomer(cust.data(), organization, db, stripe, account.id)), i * 20)
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
    const customersRef = admin.firestore().collection(`organizations/${organization}/customer`)
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


const createStripeCustomer = async (customer, organization, db, stripe, stripeAccount) => {
  functions.logger.log(stripeAccount)
  const stripeCustomer = await stripe.customers.create(toStripeCustomerFields(customer), {stripeAccount: stripeAccount});
  // query service log records whose cust_id matches customer.id
  // update to add the stripeID
  const logsRef = db.collection(`organizations/${organization}/service_logs`)
  const snapshot = await logsRef.where('cust_id', '==', customer.id).get()
  let promises = []
  snapshot.forEach(doc => {
    promises.push(db.doc(doc.ref.path).update({stripeID: stripeCustomer.id}))
  });
  return Promise.all(promises).then(async() => {
    const custRef = db.collection(`organizations/${organization}/customer`).doc(customer.id)
    await custRef.update({stripeID: stripeCustomer.id})
    return stripeCustomer
  }).catch(err => {functions.logger.log(err)})
}

const createStripeAccountLink = (accountId, stripe) => {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: 'https://dev.routeworks.app', // have front end retrigger link creation and direct to onboarding flow
    return_url: 'https://dev.routeworks.app', // this is after successfully existing. check on front end for completed account
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
      email: customer.cust_email || "",
      name: customer.cust_name || "",
      phone: customer.cust_phone || "",
      address: {
        line1: customer.bill_address || "",
        city: customer.bill_city || "",
        state: customer.bill_state || "",
        postal_code: customer.bill_zip || ""
      }
    }
  )
}