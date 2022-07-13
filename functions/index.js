const functions = require('firebase-functions');
// const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
// const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const admin = require('firebase-admin');
//const { db } = require('../src/firebase');
admin.initializeApp();

exports.listUsers = functions.https.onCall((data, context) => {
  return admin.auth().listUsers()
 // .then(users => res.status(200).send(JSON.stringify(users)))  
})

exports.createUser = functions.https.onCall((data,context) => {
  const {displayName, email, password, customClaims } = data
  return admin.auth().createUser({
    email: email,
    displayName: displayName,
    password: password
  })
  .then((userRecord) => { 
      return admin.auth().setCustomUserClaims(userRecord.uid, {
        admin: customClaims.admin
      })
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
})

exports.updateUser = functions.https.onCall((data, context) => {
  const {uid, displayName, email, password, customClaims} = data
  return admin.auth().updateUser(uid, { 
    displayName: displayName,
    email: email,
    password: password
  })
  .then(userRecord => {
    return admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: customClaims.admin
    })
    .then(() => {return admin.auth().getUser(userRecord.uid)})
  })
})

exports.createDriver = functions.firestore
  .document('admin_driver/{driverID}')
  .onCreate((snap, context) => {
    const newDriver = snap.data()
    functions.logger.log("making a new driver", context.params.driverID)
    return admin.firestore().collection('driver').add({name: newDriver.name, active: newDriver.active, admin_key: context.params.driverID})
    .then(doc => {
      return doc
    }) 
    .catch((e) => {return e})  
  })

  // figure out how to generalize these functions with wildcards so I can 
// avoid making a separate set of functions for every collection
// perhaps I can make some sub collections like /admin/driver and /admin/customers
// or driver/admin and customers/admin so I can go {category}/admin for the writes
// also, make non-admin fields into a dictionary field in the non-admin document. for example: 
/*
driver
id, admin_key, details: {...nonAdminFields}
admin_driver
id, {...nonAdminFields}, {...adminFields} <- this is repeated data, but makes for one fetch instead of two when editing
*/

//createItem works. Next make update and delete functions
exports.createItem = functions.firestore
  .document('admin/admin_lists/{collection}/{ItemID}')
  .onCreate((snap, context) => {
    const newItem = snap.data()
    const newCollection = context.params.collection.substring(6) //removes 'Admin_' from collection to assign the non-admin collection
    return admin.firestore().collection(newCollection).add({...newItem.nonAdminFields, admin_key: context.params.ItemID})
    .then(doc => {
      return doc
    })
    .catch((e) => {return e})  
})

exports.deleteDriver = functions.firestore
  .document('admin_driver/{driverID}')
  .onDelete(async(snap, context) => {
    const ref = admin.firestore().collection('driver')
    const snapshot = await ref.where('admin_key', '==', context.params.driverID).get()
    snapshot.forEach(item => {
      admin.firestore().collection('driver').doc(item.id).delete()      
    })
  })

  // TODO fix this so it updates only the non-admin fields in driver
  exports.updateDriver = functions.firestore
    .document('/admin_driver/{driverID}')
    .onUpdate(async(change, context) => {
      const updatedDriver = change.after.data()
      const ref = admin.firestore().collection('driver')
      const snapshot = await ref.where('admin_key', '==', context.params.driverID).get()
      snapshot.forEach(item => {
        admin.firestore().collection('driver').doc(item.id).set({name: updatedDriver.name, active: updatedDriver.active, admin_key: context.params.driverID})    
      })  
    })










// const db = getFirestore();

// const express = require('express');
// const cors = require('cors');

// const app = express();
// app.use(cors({ origin: true }));
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
// app.get('/users', (req, res ) => {
//   initializeApp.auth().listUsers()
//   .then(results => {
//     console.log(JSON.stringify(results))
//     res.send(results)
//   })
//   .catch(err => {
//     res.send(err)
//   })

// })
// exports.users = functions.https.onRequest(app);
