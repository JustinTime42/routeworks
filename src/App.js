import React, { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, Outlet, useParams, Navigate, useNavigate } from "react-router-dom";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { UserLogin } from './auth/UserLogin'
import TopNav from "./navigation/TopNav"
import "./styles/App.css"
import { setCurrentUser } from './actions'
import { useDispatch, useSelector } from 'react-redux';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import Register from './auth/Register';
import PropertyDetails from './components/PropertyDetails';
import CustomerEditor from './components/editor_panels/CustomerEditor';
import { Alert } from 'react-bootstrap';
import { GET_VEHICLE_TYPES_SUCCESS } from './constants';
import Auditor from './components/auditor/Auditor';
//import Auditor from './components/auditor/Auditor';
const RouteBuilder = lazy(() => import('./route_builder/RouteBuilder'))
const DisplayRoute = lazy(() => import('./DisplayRoute'))
const ServiceLogs = lazy(() => import('./components/service_logs/ServiceLogs'))
const Users = lazy(() => import('./components/Users'))

const App = () => { 
  const localVersion = 0.4
  let prodVersion = 0.4
  const [user, loading, error] = useIdToken(auth);
  const stateUser = useSelector(state => state.setCurrentUser.currentUser)
  const activeTractor = useSelector(state => state.setActiveTractor.activeTractor)    
  const activeWorkType = useSelector(state => state.setActiveWorkType.workType)
  const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
  const modals = useSelector(state => state.whichModals.modals)
  const dispatch = useDispatch()
  const { routeName, custId } = useParams()
  const navigate = useNavigate()
  

  const MigrationUI = lazy(() => import('./components/migration/MigrationUI'))
  
  useEffect(() => {    
    const unsub = onSnapshot(doc(db, 'globals', 'version'), doc => {
      prodVersion = doc.data().version 
      console.log(prodVersion) 
      checkVersion() 
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
        navigate('/displayRoute')
      })      
    } else {
      dispatch(setCurrentUser(null))
     navigate('/login')
    }
  }, [user])

  useEffect(() => {
    checkVersion()
  }, [modals])

  const checkVersion = () => {
    console.log('checking version', modals.length)
    if ((prodVersion !== localVersion) && (modals.length === 0)) {
      console.log(modals)
      alert('New software version. Click OK to refresh')
      window.location.reload()
    }
  }

  
// TODO this routing is messy, fix it
  if (!stateUser) {
    console.log('null user')
    return (
      <Routes>
        <Route path='/' element={<UserLogin />} /> 
        <Route path='login' element={<UserLogin />} />
        <Route path='register' element={<Register />} />    
      </Routes>
    )
  } else if (['Driver', 'Supervisor', 'Admin'].includes(stateUser?.claims?.role)) {   
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Routes> 
          <Route path='/' element={<Navigate to="displayRoute" />} /> 
          <Route path='displayRoute/*' element={<TopNav />}>
              <Route path=":routeName" element={<DisplayRoute />}>
                  <Route path=":custId" element={<PropertyDetails />} />
                  <Route path="customer/:custId" element={<PropertyDetails />} />
              </Route>
              
          </Route>
          <Route path="routebuilder/*" element={<TopNav /> }>
            <Route path=":routeName" element={<RouteBuilder />}>
              <Route path=":custId" element={<CustomerEditor />} />
            </Route>
          </Route>
          <Route path='admin/*' element={<TopNav />}>
            <Route path="logs" element={<ServiceLogs />} />
            <Route path="users" element={<Users />} />
            <Route path="migration" element={<MigrationUI />} /> 
            <Route path="auditor" element={<Auditor />} />
          </Route>
        </Routes>
      </Suspense>
    ) 
  } else if (stateUser?.claims?.stripeRole === 'Owner') {
    return <Register />
  } 
  else {
    return (
      <Routes>
        <Route path='/' element={<Navigate to="login" />} /> 
        <Route path='login' element={<UserLogin />} />
        <Route path='register' element={<Register />} />
      </Routes>
    ) 
  }
}

export default App