import React, { useEffect, useState } from 'react'
import { Routes, Route } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { UserLogin } from './auth/UserLogin'
import TopNav from "./navigation/TopNav"
import "./styles/App.css"
import { setActiveItem, setCurrentUser } from './actions'
import { useDispatch, useSelector } from 'react-redux';
import RouteBuilder from './route_builder/RouteBuilder';
import DisplayRoute from './DisplayRoute'
import ServiceLogs from './components/service_logs/ServiceLogs';
import Users from './components/Users';
import { SET_ACTIVE_DRIVER } from './constants';
import MigrationUI from './components/migration/MigrationUI'
import { doc, onSnapshot } from 'firebase/firestore';

const App = () => { 
  const [user] = useAuthState(auth);
  const [version, setVersion] = useState(.3)
  const stateUser = useSelector(state => state.setCurrentUser.currentUser)
  const dispatch = useDispatch()
  
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'globals', 'version'), doc => {
      if(version !== doc.data().version) {
        setVersion(doc.data().version)
      }      
    })
    return () => {
      unsub()
    }
  },[])

  useEffect(() => {
    if (version !== .3) {
      alert('New software version. Click OK to refresh')
      window.location.reload()
      console.log(version)
    }

  },[version])

  useEffect(() => {
    if(user) {
      user.getIdTokenResult().then(user => {
        console.log(user)
        dispatch(setCurrentUser(user))
      })
    } else {
      dispatch(setCurrentUser(null))
    }
  }, [user])

 if (['Driver', 'Supervisor', 'Admin'].includes(stateUser?.claims?.role)) {    
    return (
      <>
      <TopNav />
      <Routes>
        <Route path="/" element={<DisplayRoute />} />
        <Route path="routebuilder" element={<RouteBuilder />} />
        <Route path="logs" element={<ServiceLogs />} />
        <Route path="users" element={<Users />} />
        {/* <Route path="migration" element={<MigrationUI />} /> */}
      </Routes>
      </>
    ) 
  // } else if (!stateUser?.claims?.stripeRole) {
  //   let checkoutPage = 'https://buy.stripe.com/test_9AQ4jo7SS0wS5yw000'          
  //   window.open(checkoutPage, '_blank')
   }
  
  else {
    console.log(user)
    return <UserLogin />
  }
}

export default App