const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
app.get('/users', (req, res ) => {
  initializeApp.auth().listUsers()
  .then(results => {
    console.log(results)
    res.send(results)
  })
  .catch(err => {
    res.send(err)
  })

})
exports.users = functions.https.onRequest(app);
