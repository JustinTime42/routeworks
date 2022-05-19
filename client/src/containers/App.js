import React, { useState, useEffect} from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase/compat/app';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import 'firebase/compat/auth';
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentUser } from '../actions'
import HomePage from "../containers/Home"
import {BrowserRouter as Router, Route, Switch} from "react-router-dom"
import CallbackPage from "../auth/Callback"
import Auth from "../auth/Auth"
import { UserLogin } from '../auth/UserLogin'
import Driver from "../containers/Driver"
import "../App.css"

const firebaseConfig = {
  apiKey: "AIzaSyAz_B_1cW3bWfQkol5Q6uRJcWajO7YXDwY",
  authDomain: "route-manager-dev-80270.firebaseapp.com",
  projectId: "route-manager-dev-80270",
  storageBucket: "route-manager-dev-80270.appspot.com",
  messagingSenderId: "133436449157",
  appId: "1:133436449157:web:2a8b8bb960a963c47824ec",
  measurementId: "G-7KG3DHMY56"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const config = {
  apiKey: 'AIzaSyAz_B_1cW3bWfQkol5Q6uRJcWajO7YXDwY',
  authDomain: 'route-manager-dev-80270.firebaseapp.com',
  // ...
};
firebase.initializeApp(config);

// Configure FirebaseUI.
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // We will display Google and Facebook as auth providers.
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
};

const App = (props) => { 
  
  const dispatch = useDispatch()
  const [isSignedIn, setIsSignedIn] = useState(false);
  
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
      setIsSignedIn(!!user);
    });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  let currentUser = useSelector(state => state.setCurrentUser.currentUser)
 // const handleOnIdle = () => handleLogout()

  // const userQuery = new Parse.Query('_User');
  // const {
  //    isLive,
  //    isLoading,
  //    isSyncing,
  //    results,
  //    count,
  //    error,
  //    reload
  //  } = useParseQuery(userQuery);


  useEffect(() => {
    console.log(currentUser)
  }, [currentUser])



  // const getCurrentUser = async function () {
  //   const user = await Parse.User.current();
  //   console.log(user)
  //   dispatch(setCurrentUser(user))    
  // };

  // now I need to be able to pause the idle time using the "pause" method if hourly timer is running
  // 

  if (!isSignedIn) {
    return (
      <div>
        <h1>My App</h1>
        <p>Please sign-in:</p>
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
      </div>
    );
  }
  return (
    <Driver />
  );
}

  export default App