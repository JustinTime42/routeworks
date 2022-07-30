const functions = require('firebase-functions');

const admin = require('firebase-admin');
const e = require('express');
//const { db } = require('../src/firebase');
admin.initializeApp();

exports.listUsers = functions.https.onCall((data, context) => {
  return admin.auth().listUsers()
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

exports.updateRoutesAssigned = functions.https.onCall(async(data, context) => {
  const { custID, routeName, whereTo } = data  
  if (whereTo === 'on') {
    const customer = admin.collection(`driver/driver_lists/customer`).doc(custID)
    return customer.update({
      routes_assigned: admin.FieldValue.arrayUnion(routeName)
    })
    .then(res => {return(res)})
    .catch(err => {return(err)})
  } else if (whereTo === 'off') {
    const customer = admin.collection(`driver/driver_lists/customer`).doc(custID)
    return customer.update({
      routes_assigned: admin.FieldValue.arrayRemove(routeName)
    })
    .then(res => {return(res)})
    .catch(err => {return(err)})
  } else return('no change needed')
})

exports.createItem = functions.firestore
  .document('admin/admin_lists/{collection}/{itemID}')
  .onCreate((snap, context) => {
    const { collection, itemID} = context.params
    const newItem = snap.data()
    return admin.firestore().collection(`driver/driver_lists/${collection}`).add({...newItem.nonAdminFields, admin_key: itemID})
    .then(doc => {
      return doc
    })
    .catch((e) => {return e})  
})

exports.updateItem = functions.firestore
  .document('admin/admin_lists/{collection}/{itemID}')
  .onUpdate(async(change, context) => {
    const { collection, itemID} = context.params
    const updatedItem = change.after.data()
    const ref = admin.firestore().collection(`driver/driver_lists/${collection}`)
    const snapshot = await ref.where('admin_key', '==', itemID).get()
    snapshot.forEach(item => {
      admin.firestore().collection(`driver/driver_lists/${collection}`).doc(item.id).set({...updatedItem.nonAdminFields}, { merge: true })    
    })
  }) 

exports.deleteItem = functions.firestore
.document('admin/admin_lists/{collection}/{itemID}')
.onDelete(async(snap, context) => {
  const { collection, itemID} = context.params
  const ref = admin.firestore().collection(`driver/driver_lists/${collection}`)
  const snapshot = await ref.where('admin_key', '==', itemID).get()
  snapshot.forEach(item => {
    admin.firestore().collection(`driver/driver_lists/${collection}`).doc(item.id).delete()      
  })
})
