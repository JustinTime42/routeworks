const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {defineSecret} = require('firebase-functions/params');
const {getAuth} = require('firebase-admin/auth');
admin.initializeApp();
const client = new admin.firestore.v1.FirestoreAdminClient();

const stripeKey = defineSecret('STRIPE_KEY');
const stripe = require('stripe')(stripeKey);

exports.listUsers = functions.https.onCall((data, context) => {
  const {role, organization} = context.auth.token;
  const results = [];
  return admin.auth().listUsers()
      .then((userList) => {
        functions.logger.log(userList);
        userList.users.forEach((user) => {
          functions.logger.log(user);
          if ((user.customClaims.organization === organization) &&
          (role === 'Admin')) {
            functions.logger.log(user);
            results.push(user);
          }
        });
        functions.logger.log(results);
        return results;
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

exports.createOrg = functions.https.onCall((data, context) => {
  const user = getAuth().getUser(data.auth.token.uid);
  const customClaims = user.customClaims;
  const stripeRole = context.auth.token.stripeRole;
  const {orgName} = data;
  functions.logger.log('uid: ', context.auth.uid);
  functions.logger.log('orgName: ', orgName);
  if (stripeRole !== 'Owner') {
    throw new HttpsError('failed-precondition', 'Insufficient permissions');
  } else {
    if (orgName === '') {
      throw new HttpsError('failed-precondition', 'Include organization name');
    } else {
      return admin.firestore().collection('organizations').add({
        orgName: orgName,
      })
          .then((doc) => {
            customClaims['organization'] = doc.id;
            customClaims['role'] = 'Admin';
            return admin.auth()
                .setCustomUserClaims(data.auth.token.uid, customClaims)
                .then(() => {
                  functions.logger.log(admin.auth().getUser(context.auth.uid));
                  return admin.auth().getUser(context.auth.uid);
                })
                .catch((err) => {
                  functions.logger.log(err);
                });
          })
          .catch((e) => {
            functions.logger.log(e);
          });
    }
  }
});

exports.createUser = functions.https.onCall((data, context) => {
  const {displayName, email, customClaims, disabled} = data;
  customClaims['organization'] = organization;
  const role = context.auth.token.role;
  const organization = context.auth.token.organization;
  // assign organization based on context.token
  if (!context.auth) {
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

exports.updateUser = functions.https.onCall((data, context) => {
  const {uid, displayName, email, customClaims, disabled} = data;
  const organization = context.auth.token.organization;
  const role = context.auth.token.role;
  if (!context.auth) {
    // Throwing an HttpsError if not logged in
    throw new HttpsError('failed-precondition', 'Not authenticated.');
  } else if (role !== 'Admin') {
    // Throwing an HttpsError if not Admin
    throw new HttpsError('failed-precondition', 'Insufficient permissions');
  } else {
    return admin.auth().getUser(uid).then((userRecord) => {
      if (userRecord.customClaims.organization === organization) {
        return admin.auth().updateUser(data.uid, {
          email: email,
          displayName: displayName,
          disabled: disabled,
        })
            .then((result) => {
              return admin.auth().setCustomUserClaims(result.uid, customClaims)
                  .then(() => {
                    return admin.auth().getUser(result.uid);
                  });
            });
      } else functions.logger.log('wrong organization');
    });
  }
});

exports.deleteUser = functions.https.onCall((data, context) => {
  const {uid, displayName, customClaims} = data;
  const organization = context.auth.token.organization;
  const role = context.auth.token.role;
  functions.logger.log(`attempting to delete ${displayName}`);
  if (!context.auth) {
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
exports.createStripeConnectedAccount = onCall((request) => {
  const {organization} = request.auth.token;
  stripe.accounts.create({
    type: 'standard',
  })
      .then((account) => {
        // write account.id into the organization document
        const organizationRef = admin.firestore()
            .collection('organizations').doc(organization);
        organizationRef.update({
          stripe_account_id: account.id,
        })
            .then((res) => null)
            .catch((err) => err);
        // generate and return an account link
        return createStripeAccountLink(account.id);
      })
      .then((accountLink) => {
        return accountLink.url;
      })
      .catch((err) => {
        throw new HttpsError('unknown', 'Failed to create a new account');
      });
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
  stripe.accountLinks.create({
    account: accountId,
    refresh_url: 'https://app.routeworks.com/billing/setup', // have front end retrigger link creation and direct to onboarding flow
    return_url: 'https://app.routeworks.com/billing', // this is after successfully existing. check on front end for completed account
    type: 'account_onboarding',
  })
      .then((accountLink) => {
        return accountLink;
      })
      .catch((err) => {
        throw new HttpsError('unknown', 'Failed to generate account link');
      });
};

exports.connectLogsToCust = onCall((request) => {
  const organization = request.auth.token.organization;
  const role = request.auth.token.role;
  if (!request.auth) {
    // Throwing an HttpsError if not logged in
    throw new HttpsError('failed-precondition', 'Not authenticated.');
  } else if (role !== 'Admin') {
    // Throwing an HttpsError if not Admin
    throw new HttpsError('failed-precondition', 'Insufficient permissions');
  } else {
    const customersRef = admin.firestore()
        .collection(`organizations/${organization}/customer`);
    const logsRef = admin.firestore()
        .collection(`organizations/${organization}/service_logs`);
    logsRef.get().then((logsSnapshot) => {
      logsSnapshot.forEach((result) => {
        const entry = result.data();
        if (entry.cust_id) return;
        return customersRef
            .where('cust_name', '==', entry.cust_name)
            .where('service_address', '==', entry.service_address)
            .get()
            .then((custSnapshot) => {
              if (custSnapshot.empty) {
                // create a new customer from the appropriate log fields
                return customersRef.add({
                  service_address: entry.service_address,
                  contract_type: entry.contract_type,
                  cust_name: entry.cust_name,
                  cust_email: entry.cust_email,
                  cust_email2: entry.cust_email2,
                  include_email2: entry.include_email2,
                  value: entry.value,
                }).then((res) => {
                  return logsRef.doc(entry.id)
                      .set({cust_id: res.id}, {merge: true});
                });
              } else {
                // set logEntry.cust_id to the id of the found customer
                custSnapshot.forEach((customer) => {
                  return logsRef.doc(entry.id)
                      .set({cust_id: customer.id}, {merge: true});
                });
              }
            });
      });
    });
  }
});
