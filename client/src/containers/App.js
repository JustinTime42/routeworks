import React, {useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { UserLogin } from '../auth/UserLogin'
import Driver from "../containers/Driver"
import "../App.css"
import { setCurrentUser } from '../actions';

const App = (props) => { 
  const [user] = useAuthState(auth);
  const currentUser = useSelector(state => state.setCurrentUser.currentUser)
  const dispatch = useDispatch() 

  useEffect(() => {    
    if(user) {
      user.getIdTokenResult()
      .then(result => dispatch(setCurrentUser(result.claims)))
    }    
  },[user])

  if (user) {
    return <Driver />
  } else {
    return <UserLogin />
  }
}

  export default App