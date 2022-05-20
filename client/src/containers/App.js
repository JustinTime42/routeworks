import React, {useEffect} from 'react'
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { UserLogin } from '../auth/UserLogin'
import Driver from "../containers/Driver"
import "../App.css"

const App = (props) => { 
  const [user] = useAuthState(auth);

  useEffect(() => {
    console.log(user)
  },[user])
  if (user) {
    return <Driver />
  } else {
    return <UserLogin />
  }
}

  export default App