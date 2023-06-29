const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {onCall} = require("firebase-functions/v2/https")
const {defineString} = require("firebase-functions/params");
admin.initializeApp();
const client = new admin.firestore.v1.FirestoreAdminClient();
const bucket = 'gs://cron-backups';

const stripeKey = defineSecret("STRIPE_TEST_KEY");
const stripe = require('stripe')(stripeKey);

exports.listUsers = functions.https.onCall((data, context) => {
  const {role, organization} = context.auth.token 
  let results = [] 
  return admin.auth().listUsers()
  .then(userList => {
    functions.logger.log(userList)
      userList.users.forEach(user => {
        functions.logger.log(user)
        if ((user.customClaims.organization === organization)
          && (role === 'Admin')) {
            functions.logger.log(user)
            results.push(user)
          }
      })
      functions.logger.log(results)
    return results    
  })
})

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

// Call this when creating a new stripe account
exports.createStripeConnectedAccount = onCall(async (request) => {
  const { organization } = request.auth.token
  const account = await stripe.accounts.create({
    type: 'standard',
  });

  // write account.id into the organization document
  const organizationRef = admin.firestore().collection('organizations').doc(organization);
  await organizationRef.update({
    stripe_account_id: account.id
  });
  // create a stripe account link and return the url
  const accountLink = createStripeAccountLink(account.id)
  return accountLink.url
})

// Call this when getting an account link for existing account
exports.getAccountLink = onCall(async request => {
  // get stripe account id from organization document 
  const { organization } = request.auth.token;
  const organizationRef = admin.firestore().collection('organizations').doc(organization);
  const { stripe_account_id } = await organizationRef.get();
  createStripeAccountLink(stripe_account_id);
})

const createStripeAccountLink = async (accountId) => {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: 'https://app.routeworks.com/billing/setup', // have front end retrigger link creation and direct to onboarding flow
    return_url: 'https://app.routeworks.com/billing', // this is after successfully existing. check on front end for completed account
    type: 'account_onboarding',
  });
  return accountLink
}

exports.createOrg = functions.https.onCall((data, context) => {
  const stripeRole = context.auth.token.stripeRole
  const { orgName } = data
  functions.logger.log('uid: ', context.auth.uid)
  functions.logger.log('orgName: ', orgName)
  if (stripeRole !== 'Owner') {
    throw new functions.https.HttpsError('failed-precondition', 'Insufficient permissions');
  } else {
    if (orgName === '') {
      throw new functions.https.HttpsError('failed-precondition', 'Must include organization name');
    } else {
      return admin.firestore().collection('organizations').add({
        orgName: orgName
      })
      .then(doc => {
        return admin.auth().setCustomUserClaims(context.auth.uid, {...context.auth.customClaims, organization: doc.id, role: 'Admin'})
        .then(() => {          
          functions.logger.log(admin.auth().getUser(context.auth.uid))
          return admin.auth().getUser(context.auth.uid)
        })
        .catch(err => {
          functions.logger.log(err)
        })
      })
      .catch(e => {
        functions.logger.log(e)
      })
    }
  }
})

exports.createUser = functions.https.onCall((data,context) => {
  const {displayName, email, password, customClaims, disabled } = data
  const role = context.auth.token.role
  const organization = context.auth.token.organization
  // assign organization based on context.token
  if (!context.auth) {
    // Throwing an HttpsError if not logged in
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  } else if (role !== 'Admin') {
    // Throwing an HttpsError if not Admin
    throw new functions.https.HttpsError('failed-precondition', 'Insufficient permissions');
  } else {
    return admin.auth().createUser({
      email: email,
      displayName: displayName,
      disabled: disabled,
    })
    .then((userRecord) => { 
        return admin.auth().setCustomUserClaims(userRecord.uid, {...customClaims, organization: organization})
        .then(() => {          
          return admin.auth().getUser(userRecord.uid)
        })
        .catch(err => {
          return err
        })
    })
    .catch(err => {
      return err
    })
  }
})

exports.updateUser = functions.https.onCall((data, context) => {
  const {uid, displayName, email, password, customClaims, disabled } = data
  const organization = context.auth.token.organization
  const role = context.auth.token.role
  if (!context.auth) {
    // Throwing an HttpsError if not logged in
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  } else if (role !== 'Admin') {
    // Throwing an HttpsError if not Admin
    throw new functions.https.HttpsError('failed-precondition', 'Insufficient permissions');
  } else {
    return admin.auth().getUser(uid).then((userRecord) => {
      if(userRecord.customClaims.organization === organization) {
        return admin.auth().updateUser(data.uid, {
          email: email,
          displayName: displayName,
          disabled: disabled,
        })
        .then(result => {
          return admin.auth().setCustomUserClaims(result.uid, {...customClaims})
          .then(() => {
            return admin.auth().getUser(result.uid)
          })
        })
      } else functions.logger.log('wrong organization')
    })
  }
});

exports.deleteUser = functions.https.onCall((data, context) => {
  const {uid, displayName, email, password, customClaims, disabled } = data
  const organization = context.auth.token.organization
  const role = context.auth.token.role
  functions.logger.log(`attempting to delete ${displayName}`)
  if (!context.auth) {
    // Throwing an HttpsError if not logged in
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  } else if ((role !== 'Admin') || (organization !== customClaims.organization)) {
    // Throwing an HttpsError if not Admin
    throw new functions.https.HttpsError('failed-precondition', 'Insufficient permissions');
  } else {
    functions.logger.log(`deleting ${displayName}`)
    return admin.auth().deleteUser(uid)
    .then(response => {
      return response
    })
    .catch(err => {return err})
  }
})

exports.scheduledBackup = functions.pubsub
  .schedule('snowline-daily-backup')
  .onRun(async (context) => {
    const projectId = 'route-manager-5f65b' // process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    
    const databaseName = client.databasePath(projectId, '(default)');
    return client.exportDocuments({
      name: databaseName,
      outputUriPrefix: bucket,
      collectionIds: []
    })
    .then(responses => {
      const response = responses[0];
      console.log(`Operation Name: ${response['name']}`);
    })
    .catch(err => {
      console.error(err);
      throw new Error('Export operation failed');
    });
  })

exports.updateLogEntry = functions.firestore 
  .document('organizations/{organization}/service_logs/{itemID}')
  .onUpdate(async(change, context) => {
    const organization = context.params.organization
    const { timestamp } = context
    const { itemID} = context.params
    return admin.firestore().collection(`organizations/${organization}/audit_logs`).add({
      log_id: itemID, 
      cust_id: change.before?.id,
      timestamp: new Date(timestamp), 
      before: change.before.data(),
      after: change.after.data()
    })
    .then(doc => {
      return doc
    })
    .catch((e) => {return e}) 
  })

  exports.deleteLogEntry = functions.firestore
  .document(`organizations/{organization}/service_logs/{itemID}`)
  .onDelete(async(snap, context) => {
    const organization = context.params.organization
    const record = snap.data()
    const { timestamp } = context
    const {itemID } = context.params
    return admin.firestore().collection(`organizations/${organization}/audit_logs`).add({
      log_id: itemID,
      cust_id: record.cust_id,
      timestamp: new Date(timestamp),
      deleted: record

    })
    .then(doc => {
      return doc
    })
    .catch((e) => {return e})
  })

  exports.writeCustomer = functions.firestore 
  .document('organizations/{organization}/customer/{itemID}')
  .onWrite(async(change, context) => {
    const organization = context.params.organization
    const { timestamp } = context
    const { itemID} = context.params
    return admin.firestore().collection(`organizations/${organization}/audit_customers`).add({
      cust_id: itemID, 
      timestamp: new Date(timestamp), 
      before: change.before?.data() || null, 
      after: change.after?.data() || null,
    })
    .then(doc => {
      return doc
    })
    .catch((e) => {return e}) 
  })

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

// exports.deleteCustomer = functions.firestore
// .document('driver/driver_lists/customer/{itemID}')
// .onDelete(async(snap, context) => {
//   const collectionRef = admin.firestore().collection('driver/driver_lists/route')
//   const {itemID} = context.params
//   const routeList = snap.data().routesAssigned
//   routeList.forEach((route) => {
//     return collectionRef.where('name', '==', route).get()  
//     .then((snapshot) => {
//       if(snapshot.empty) {
//         functions.logger.log('empty route object')
//         return ('empty route object')
//       }
//       snapshot.forEach(route => {
//         let thisRoute = {...route.data()}
//         thisRoute.customers.splice(thisRoute.customers.findIndex(item => item.id === itemID), 1)
//         return admin.firestore().collection('driver/driver_lists/route').doc(route.id).set(thisRoute, {merge: true})
//         .then(() => {
//           functions.logger.log('successfully changed', thisRoute.customers) 
//         })  
//       })
//     })
//   })
// })

// exports.updateItem = functions.firestore
//   .document('admin/admin_lists/{collection}/{itemID}')
//   .onUpdate(async(change, context) => {
//     const { collection, itemID} = context.params
//     const updatedItem = change.after.data()
//     const ref = admin.firestore().collection(`driver/driver_lists/${collection}`)
//     const snapshot = await ref.where('admin_key', '==', itemID).get()
//     snapshot.forEach(item => {
//       admin.firestore().collection(`driver/driver_lists/${collection}`).doc(item.id).set({...updatedItem.nonAdminFields}, { merge: true })    
//     })
//   }) 
//below is now handled on the frontend
// exports.updateRoutesAssigned = functions.https.onCall(async(data, context) => {
//   const { custID, routeName, whereTo } = data  
//   if (whereTo === 'on') {
//     const customer = admin.collection(`driver/driver_lists/customer`).doc(custID)
//     return customer.update({
//       routes_assigned: admin.FieldValue.arrayUnion(routeName)
//     })
//     .then(res => {return(res)})
//     .catch(err => {return(err)})
//   } else if (whereTo === 'off') {
//     const customer = admin.collection(`driver/driver_lists/customer`).doc(custID)
//     return customer.update({
//       routes_assigned: admin.FieldValue.arrayRemove(routeName)
//     })
//     .then(res => {return(res)})
//     .catch(err => {return(err)})
//   } else return('no change needed')
// })

// exports.createItem = functions.firestore
//   .document('admin/admin_lists/{collection}/{itemID}')
//   .onCreate((snap, context) => {
//     const { collection, itemID} = context.params
//     const newItem = snap.data()
//     return admin.firestore().collection(`driver/driver_lists/${collection}`).add({...newItem.nonAdminFields, admin_key: itemID})
//     .then(doc => {
//       return doc
//     })
//     .catch((e) => {return e})  
// })

// exports.updateItem = functions.firestore
//   .document('admin/admin_lists/{collection}/{itemID}')
//   .onUpdate(async(change, context) => {
//     const { collection, itemID} = context.params
//     const updatedItem = change.after.data()
//     const ref = admin.firestore().collection(`driver/driver_lists/${collection}`)
//     const snapshot = await ref.where('admin_key', '==', itemID).get()
//     snapshot.forEach(item => {
//       admin.firestore().collection(`driver/driver_lists/${collection}`).doc(item.id).set({...updatedItem.nonAdminFields}, { merge: true })    
//     })
//   }) 

// exports.deleteItem = functions.firestore
// .document('admin/admin_lists/{collection}/{itemID}')
// .onDelete(async(snap, context) => {
//   const { collection, itemID} = context.params
//   const ref = admin.firestore().collection(`driver/driver_lists/${collection}`)
//   const snapshot = await ref.where('admin_key', '==', itemID).get()
//   snapshot.forEach(item => {
//     admin.firestore().collection(`driver/driver_lists/${collection}`).doc(item.id).delete()      
//   })
// })
