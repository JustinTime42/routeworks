import React, { useEffect, useState } from 'react'
import { Routes, Route } from "react-router-dom";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { UserLogin } from './auth/UserLogin'
import TopNav from "./navigation/TopNav"
import "./styles/App.css"
import { setCurrentUser } from './actions'
import { useDispatch, useSelector } from 'react-redux';
import RouteBuilder from './route_builder/RouteBuilder';
import DisplayRoute from './DisplayRoute'
import ServiceLogs from './components/service_logs/ServiceLogs';
import Users from './components/Users';
// import MigrationUI from './components/migration/MigrationUI'
import { doc, onSnapshot } from 'firebase/firestore';
import Register from './auth/Register.tsx';

const App = () => { 
  const currentVersion = 0.5
  const [user, loading, error] = useIdToken(auth);
  const stateUser = useSelector(state => state.setCurrentUser.currentUser)
  const dispatch = useDispatch()
  
  useEffect(() => {
      const unsub = onSnapshot(doc(db, 'globals', 'version'), doc => {
        if(currentVersion !== doc.data().version) {
          alert('New software version. Click OK to refresh')
        window.location.reload()          
        }      
      })
      return () => {
        unsub()
      }
  },[])

  useEffect(() => {
    if (error) {alert(error)}    
    else if (user) {
      user.getIdTokenResult().then(result => {
        console.log(result)
        dispatch(setCurrentUser(result))
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
  } else if (stateUser?.claims?.stripeRole === 'Owner') {
    return <Register />
   }  
  else {
    console.log(user)
    return (
      <Routes>
        <Route path='/' element={<UserLogin />} />
        <Route path='register' element={<Register />} />
      </Routes>
    ) 
  }
}

export default App