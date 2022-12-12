const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

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

exports.createOrg = functions.https.onCall(async(data, context) => {
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
        } )
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

exports.updateLogEntry = functions.firestore 
  .document('service_logs/{itemID}')
  .onUpdate(async(change, context) => {
    const { timestamp } = context
    const { itemID} = context.params
    return admin.firestore().collection(`audit_logs`).add({
      id: itemID, 
      timestamp: timestamp, 
      before: change.before.data(),
      after: change.after.data()
    })
    .then(doc => {
      return doc
    })
    .catch((e) => {return e}) 
  })

  exports.deleteLogEntry = functions.firestore
  .document('service_logs/{itemID}')
  .onDelete(async(snap, context) => {
    const record = snap.data()
    const { timestamp } = context
    const {itemID } = context.params
    return admin.firestore().collection(`audit_logs`).add({
      id: itemID, 
      timestamp: timestamp,
      deleted: record
    })
    .then(doc => {
      return doc
    })
    .catch((e) => {return e})
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
