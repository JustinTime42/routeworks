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
import { GET_VEHICLE_TYPES_SUCCESS, GET_WORK_TYPES_SUCCESS } from './constants';
import Auditor from './components/auditor/Auditor';
import PricingTemplates from './pricing_templates/PricingTemplates';
//import Auditor from './components/auditor/Auditor';
const RouteBuilder = lazy(() => import('./route_builder/RouteBuilder'))
const DisplayRoute = lazy(() => import('./DisplayRoute'))
const ServiceLogs = lazy(() => import('./components/service_logs/ServiceLogs'))

const Users = lazy(() => import('./components/Users'))

const App = () => { 
  const localVersion = 0.5
  let prodVersion = 0.5
  const [user, loading, error] = useIdToken(auth);
  const currentUser = useSelector(state => state.setCurrentUser.currentUser)
  const activeTractor = useSelector(state => state.setActiveTractor.activeTractor)    
  const activeWorkType = useSelector(state => state.setActiveWorkType.workType)
  const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
  const modals = useSelector(state => state.whichModals.modals)
  const dispatch = useDispatch()
  const { routeId, custId } = useParams()
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

  // useEffect to subscribe to work_type collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, `organizations/${currentUser?.claims?.organization}/work_type`), (querySnapshot) => {
      dispatch({type:GET_WORK_TYPES_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
    })  
    return () => {
      unsub()
    }
  },[currentUser])


  useEffect(() => {
    if (error) {alert(error)}
    else if (user) {
      user.getIdTokenResult().then(result => {
        console.log(result)
        dispatch(setCurrentUser(result))
        // if (!currentUser) {
        //   navigate("/")
        // }       
      })      
    } else {
      dispatch(setCurrentUser(null))
      // navigate('/')
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

  if (['Driver', 'Supervisor', 'Admin'].includes(currentUser?.claims?.role)) {   
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Routes> 
          <Route path='/login' element={<UserLogin />} />
          <Route path='/register' element={<Register />} />
          <Route path='/' element={<Navigate to="displayRoute" />} /> 
          <Route path='displayRoute/*' element={<TopNav />}>
              <Route index element={<DisplayRoute />} />
              <Route path=":routeId" element={<DisplayRoute />}>
                  <Route path=":custId" element={<PropertyDetails />} />
                  <Route path="customer/:custId" element={<PropertyDetails />} />
              </Route>              
          </Route>
          <Route path="routebuilder/*" element={<TopNav /> }>
            <Route index element={<RouteBuilder />} />
            <Route path=":routeId" element={<RouteBuilder />}>
              <Route path=":custId" element={<CustomerEditor />} />
            </Route>
          </Route>
          <Route path='admin/*' element={<TopNav />}>
            <Route path="logs" element={<ServiceLogs />} />
            <Route path="users" element={<Users />} />
            <Route path="migration" element={<MigrationUI />} /> 
            <Route path="auditor" element={<Auditor />} />
            <Route path="pricing_templates" element={<PricingTemplates />} />
          </Route>
        </Routes>
      </Suspense>
    ) 
  }
  // else if (currentUser && !currentUser?.claims?.organization) {
  //   return <Register />
  // } 
  else {
      console.log('null user')
      return (
        // <UserLogin />
        <Routes>
          <Route path='/' element={<UserLogin />} /> 
          <Route path='login' element={<UserLogin />} />
          <Route path='register' element={<Register />} />    
        </Routes>
      )
  }
}

export default App