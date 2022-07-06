import React, { useEffect } from 'react'
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { UserLogin } from '../auth/UserLogin'
import Driver from "../containers/Driver"
import "../App.css"
import { setCurrentUser } from '../actions'
import { useDispatch } from 'react-redux';

const App = (props) => { 
   const [user] = useAuthState(auth);
   const dispatch = useDispatch()

  useEffect(() => {
    if(user) {
      user.getIdTokenResult().then(user => {
        console.log(user.claims)
        dispatch(setCurrentUser(user.claims))
      })      
    }  
  }, [user])

  if (user) {
    return <Driver />
  } else {
    return <UserLogin />
  }
}

export default App