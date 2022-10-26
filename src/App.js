import React, { useEffect } from 'react'
import { Routes, Route } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import { UserLogin } from './auth/UserLogin'
import TopNav from "./navigation/TopNav"
import "./styles/App.css"
import { setActiveItem, setCurrentUser } from './actions'
import { useDispatch, useSelector } from 'react-redux';
import RouteBuilder from './route_builder/RouteBuilder';
import DisplayRoute from './DisplayRoute'
import ServiceLogs from './components/service_logs/ServiceLogs';
import UserEditor from './components/editor_panels/UserEditor';
import { SET_ACTIVE_DRIVER } from './constants';
// import MigrationUI from './components/migration/MigrationUI'

const App = () => { 
  const [user] = useAuthState(auth);
  const drivers = useSelector(state => state.getDrivers.drivers)
  const activeDriver = useSelector(state => state.setActiveDriver.driver)
  const dispatch = useDispatch()

  useEffect(() => {
    if(user) {
      user.getIdTokenResult().then(user => {
        console.log(user.claims)
        dispatch(setCurrentUser(user.claims))
      })      
    }  
  }, [user])

  // useEffect(() => {
  //   if(user && (drivers.length > 0) && !activeDriver.name) {
  //     console.log(drivers)
  //     dispatch(setActiveItem(user.claims.name, drivers, SET_ACTIVE_DRIVER))
  //   }
  // }, [user, drivers])

  if (user) {
    return (
      <>
      <TopNav />
      <Routes>
        <Route path="/" element={<DisplayRoute />} />
        <Route path="routebuilder" element={<RouteBuilder />} />
        <Route path="logs" element={<ServiceLogs />} />
        <Route path="users" element={<UserEditor />} />
        {/* <Route path="migration" element={<MigrationUI />} /> */}
      </Routes>
      </>
    ) 
  } else {
    return <UserLogin />
  }
}

export default App