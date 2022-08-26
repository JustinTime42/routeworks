import React, { useEffect } from 'react'
import { Routes, Route, Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import { UserLogin } from './auth/UserLogin'
import TopNav from "./navigation/TopNav"
import "./styles/App.css"
import { setCurrentUser } from './actions'
import { useDispatch } from 'react-redux';
import RouteBuilder from './route_builder/RouteBuilder';
import DisplayRoute from './DisplayRoute'
import ServiceLogs from './components/service_logs/ServiceLogs';

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
    return (
      <>
      <TopNav />
      <Routes>
        <Route path="/" element={<DisplayRoute />} />
        <Route path="routebuilder" element={<RouteBuilder />} />
        <Route path="logs" element={<ServiceLogs />} />

      </Routes>
      </>
      
      //

      
      // showRouteEditor && activeRoute.id ? <RouteBuilder /> : 
      // activeTractor.name && (activeDriver.key !== '')  && activeWorkType.name && activeRoute.id ? <DisplayRoute /> :

    ) 
  } else {
    return <UserLogin />
  }
}

export default App