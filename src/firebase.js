import { initializeApp } from "firebase/app"
import { getFunctions, httpsCallable } from 'firebase/functions'
import {
    GoogleAuthProvider,
    getAuth,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
} from "firebase/auth"
import {
  getDoc,
  doc,
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
} from "firebase/firestore"

const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID,
  };

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const functions = getFunctions(app)

const logInWithEmailAndPassword = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      console.error(err)
      //alert(err.message)
    }
}

const getAdminItem = async(item, collection) => {
  console.log("getAdminItem", item)
  try {
      const docRef = doc(db, `admin/admin_lists/${collection}`, item.admin_key);
      const docSnap = await getDoc(docRef);
      const id = docSnap.id
      if (docSnap.exists()) {
          return ({...docSnap.data(), id })  
      } else {
          return `couldn't find ${item.name}`
      }
  }
  catch (e) {
      alert(e)
  }
}

const getItem = async(item, collection) => {
  try {
    const docRef = doc(db, collection, item);
    const docSnap = await getDoc(docRef);
    const id = docSnap.id
    if (docSnap.exists()) {
        return ({...docSnap.data(), id })  
    } else {
        return `couldn't find ${item.name}`
    }
  }
  catch (e) {
      alert(e)
  }
}


// const createUser = async (auth, email, password) => {
//   createUserWithEmailAndPassword(auth, email, password)
//   .then((userCredential) => {
//     // Signed in 
//     const user = userCredential.user;
//     // ...
//   })
//   .catch((error) => {
//     const errorCode = error.code;
//     const errorMessage = error.message;
//     // ..
//   })
// }

const logout = () => {
signOut(auth)
}

export {
  functions,
  createUserWithEmailAndPassword,
  app,
  auth,
  db,
  logInWithEmailAndPassword,
  logout,
  httpsCallable,
  getAdminItem,
  getItem,
}