import React, { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, Outlet, useParams, Navigate, useNavigate } from "react-router-dom";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { UserLogin } from './auth/UserLogin'
import TopNav from "./navigation/TopNav"
import "./styles/App.css"
import { setColorMode, setCurrentUser } from './actions'
import { useDispatch, useSelector } from 'react-redux';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import Register from './auth/Register';
import PropertyDetails from './components/property_details/PropertyDetails';
import CustomerEditor from './components/editor_panels/CustomerEditor';
import { Alert } from 'react-bootstrap';
import { GET_VEHICLE_TYPES_SUCCESS, GET_WORK_TYPES_SUCCESS } from './constants';
import Auditor from './components/auditor/Auditor';
import PricingTemplates from './pricing_templates/PricingTemplates';
import FleetTracker from './map_dashboard/FleetTracker';
import Customers from './customers/Customers';
import QueryBuilder from './components/global_admin/query_builder/QueryBuilder';

//import Auditor from './components/auditor/Auditor';
const RouteBuilder = lazy(() => import('./route_builder/RouteBuilder'))
const DisplayRoute = lazy(() => import('./DisplayRoute'))
const ServiceLogs = lazy(() => import('./components/service_logs/ServiceLogs'))


const Users = lazy(() => import('./components/Users'))

const App = () => { 
  const localVersion = "0.1.1"
  let prodVersion = "0.1.1"
  const [user, loading, error] = useIdToken(auth);
  const currentUser = useSelector(state => state.setCurrentUser.currentUser)
  const activeTractor = useSelector(state => state.setActiveTractor.activeTractor) 
  const colorMode = useSelector(state => state.setColorMode.colorMode)   
  const activeWorkType = useSelector(state => state.setActiveWorkType.workType)
  const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
  const modals = useSelector(state => state.whichModals.modals)
  const dispatch = useDispatch()
  const { routeId, custId } = useParams()
  const navigate = useNavigate()
  

  const MigrationUI = lazy(() => import('./components/global_admin/GlobalAdmin'))
  const UserEditor = lazy(() => import('./components/global_admin/user_editor/UserEditor'))
  useEffect(() => {    
    console.log(localStorage.getItem("colorMode") )
    localStorage.getItem('colorMode') ? dispatch(setColorMode(localStorage.getItem('colorMode'))) : dispatch(setColorMode('light'))
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
    // change data_bs_theme to light or dark depending on colorMode
    document.body.setAttribute('data-bs-theme', colorMode)
    // set local storage
    localStorage.setItem('colorMode', colorMode)
},[colorMode])

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
            <Route path="fleet_tracker" element={<FleetTracker />} />
            <Route path="customers" element={<Customers />}>
              <Route path=":custId" element={<CustomerEditor />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    ) 
  }
  else if (currentUser && currentUser?.claims?.email === "routeworksllc@gmail.com") {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Routes> 
            <Route path="/" element={<MigrationUI />} /> 
            <Route path="/users" element={<UserEditor />} />
            <Route path="/querybuilder" element={<QueryBuilder />} />
        </Routes>
      </Suspense>
    )
  } 
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