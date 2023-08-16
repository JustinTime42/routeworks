const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {defineSecret} = require('firebase-functions/params');
admin.initializeApp();
const db = admin.firestore();
const client = new admin.firestore.v1.FirestoreAdminClient();

const stripeKey = defineSecret('STRIPE_KEY');
const stripe = require('stripe')("sk_test_51M6hzpHadtZeRUpQvPwJ1oSUy47bkspiD6AynRUmG2rNJwpNIW6kxLcOktO5tuJBbG1vT0FFce91NY0DMgHr6fUU00oTnUMWXU");

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

// const sendVerificationEmail = (user, organization) => {
//   const mailOptions = {
//     from: organization,
//     to: user.email,
//     text: 'Please click the link below to verify your email address'
//   }
//   const actionCodeSettings = {
//     url: 'https://app.snowlinealaska.com',
//     handleCodeInApp: true,
//     iOS: {bundleId: "com.snowlinealaska.app"},
//     android:{
//       packageName: 'com.snowlinealaska.app',
//       installApp: true,
//     }
//   }
//   admin.auth().generateEmailVerificationLink(user.email, actionCodeSettings)
//   .then(link => {
//     return admin.auth().sendCustomer
//   })

// }

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

const createStripeCustomer = async (customer, organization) => {
  const stripeCustomer = await stripe.customers.create({
    email: customer.cust_email || "",
    name: customer.cust_name || "",
    address: {
      line1: customer.bill_address || "",
      city: customer.bill_city || "",
      state: customer.bill_state || "",
      postal_code: customer.bill_zip || ""
    }
  });
  const custRef = db.collection(`organizations/${organization}/customer`)
  await custRef.update({stripeID: customer.id})
  return stripeCustomer
}

// take an array of service events, 
// generate invoices from them, and send them to Stripe
// then set the "added to invoice" flag on the service logs entry
exports.createInvoiceItems = onCall(async (request) => {
  const {logsArray} = request.data;
  const {organization, role} = request.auth.token
  if (role !== "Admin") {
    throw new HttpsError('failed-precondition', 'Insufficient permissions');
  }

  let promises = []

  // Generate invoices from logs array
  logsArray.forEach(async(entry) => {
    // if !entry.stripeId, create new stripe customer
    let custStripeID
    if (!entry.stripeID) {
      const customer = createStripeCustomer(entry, organization)
      custStripeID = customer.id
    } else {
      custStripeID = entry.stripeID
    }

    const invoiceItem = await stripe.invoiceItems.create({
      customer: custStripeID,
      amount: entry.price * 100,
      currency: "usd",
      description: entry.description,
    });

    // update service log with invoice item id
    const logRef = db.collection(`organizations/${organization}/service_logs`).doc(entry.id)
    promises.push(logRef.update({invoice_item_id: invoiceItem.id}))    
  });
  return Promise.all(promises)
})

exports.createAndSendInvoices = onCall(async (request) => {
   // send invoice item to stripe
  const {customers, stripeAccount, dueDate} = request.data
  customers.forEach(async (customer) => {
    await stripe.invoices.create({
      customer: customer.stripeID,
      due_date: dueDate,
      on_behalf_of: stripeAccount,
      collection_method: 'send_invoice',
    })
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
  const {orgName, orgID, email} = request.data
  try {
    const account = await stripe.accounts.create({
      type: 'standard',
      email: email,
      business_profile: {
        name: orgName,
      }
    })
    await admin.firestore().collection('organizations').doc(orgID).update({
      stripe_account_id: account.id,
    })
    const custsRef = db.collection(`organizations/${orgID}/customer`)
    const custsSnapshot = await custsRef.get()
    let promises = []
    custsSnapshot.forEach(async cust => {
      promises.push(createStripeCustomer(cust)) 
    })
    return Promise.all(promises).then(() => {
      return createStripeAccountLink(account.id)
    }).catch(err => {return err})    
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
        return createStripeAccountLink(org.stripe_account_id);
      })
      .then((accountLink) => {
        return accountLink.url;
      })
      .catch((err) => {
        throw new HttpsError('unknown', 'Failed to generate account link');
      });
});

const createStripeAccountLink = (accountId) => {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: 'https://app.snowlinealaska.com/', // have front end retrigger link creation and direct to onboarding flow
    return_url: 'https://app.snowlinealaska.com/', // this is after successfully existing. check on front end for completed account
    type: 'account_onboarding',
  }).then((accountLink) => {
    return accountLink;
  }).catch((err) => {
    throw new HttpsError('unknown', 'Failed to generate account link');
  });
};

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
      if (custSnapshot.empty) {
        // create a new customer from the appropriate log fields
        const res = await customersRef.add({
          service_address: entry.service_address,
          contract_type: entry.contract_type,
          cust_name: entry.cust_name,
          cust_email: entry.cust_email,
          cust_email2: entry.cust_email2,
          include_email2: entry.include_email2,
          value: entry.value,
        })
        cust_id = res.id
      } else {
        // set logEntry.cust_id to the id of the found customer          
        custSnapshot.forEach(customer => cust_id = customer.id)
      }        
      return logsRef.doc(entry.id).set({cust_id: cust_id}, {merge: true})
    })
  }
})

// exports.connectLogsToCust = onCall((request) => {
//   const {organization, role} = request.auth.token;
//   if (!request.auth) {
//     // Throwing an HttpsError if not logged in
//     throw new HttpsError('failed-precondition', 'Not authenticated.');
//   } else if (role !== 'Admin') {
//     // Throwing an HttpsError if not Admin
//     throw new HttpsError('failed-precondition', 'Insufficient permissions');
//   } else {
//     const customersRef=db.collection(`organizations/${organization}/customer`);
//     const logsRef = db.collection(`organizations/${organization}/service_logs`);
//     return logsRef.get().then((logsSnapshot) => {
//       logsSnapshot.forEach((result) => {
//         const entry = result.data();
//         if (entry.cust_id) return;
//         return customersRef
//             .where('cust_name', '==', entry.cust_name)
//             .where('service_address', '==', entry.service_address)
//             .get()
//             .then((custSnapshot) => {
//               if (custSnapshot.empty) {
//                 // create a new customer from the appropriate log fields
//                 return customersRef.add({
//                   service_address: entry.service_address,
//                   contract_type: entry.contract_type,
//                   cust_name: entry.cust_name,
//                   cust_email: entry.cust_email,
//                   cust_email2: entry.cust_email2,
//                   include_email2: entry.include_email2,
//                   value: entry.value,
//                 }).then((res) => {
//                   return logsRef.doc(entry.id)
//                       .set({cust_id: res.id}, {merge: true});
//                 });
//               } else {
//                 // set logEntry.cust_id to the id of the found customer
//                 custSnapshot.forEach((customer) => {
//                   return logsRef.doc(entry.id)
//                       .set({cust_id: customer.id}, {merge: true});
//                 });
//               }
//             });
//       });
//     });
//   }
// });
