import React, { useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import SimpleSelector from "../components/SimpleSelector"
import ShiftSetup from './ShiftSetup'
import RouteEditor from '../components/editor_panels/RouteEditor'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import AdminDropdown from "./AdminDropdown"
import Spinner from "../components/Spinner"
import { ProgressBar, Alert } from 'react-bootstrap';
import {  setTempItem, showModal, setActiveItem} from "../actions"
import SearchBar from "./SearchBar"
import {GET_VEHICLE_TYPES_SUCCESS, REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE, UPDATE_ADDRESSES_FAILED, UPDATE_ADDRESSES_SUCCESS} from '../constants.js'
import '../styles/driver.css'

const TopNav = () => {
    const isAllPending = useSelector(state => state.requestAllAddresses.isPending)
    const routesPending = useSelector(state => state.requestRoutes.isPending)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routes = useSelector(state => state.requestRoutes.routes)
    const activeTractor = useSelector(state => state.setActiveTractor.activeTractor)    
    const activeWorkType = useSelector(state => state.setActiveWorkType.workType)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        navigate('blank')
        const unsub = onSnapshot(collection(db, `organizations/${organization}/customer`), (querySnapshot) => {
            dispatch({type: UPDATE_ADDRESSES_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
        })
        return () => {
            unsub()
        }
        
    },[])

    useEffect(() => { 
        const unsub = onSnapshot(collection(db, `organizations/${organization}/vehicle_type`), (querySnapshot) => {
          dispatch({type:GET_VEHICLE_TYPES_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
        })
        return () => {
            unsub()
        }
      },[])

    const onCreate = (whichModal) => {
        dispatch(setTempItem({name: '', active: true, editableBy: ['Supervisor', 'Admin'], customers: []}))
        dispatch(showModal(whichModal))
    }

    const onEdit = (item, whichModal) => {
        dispatch(setTempItem(item))
        dispatch(showModal(whichModal))
    }
    
    const onSelect = (event, itemArray, setActiveAction) => {
        console.log(location)
        const routeId = routes.find(i => i.name === event).id
        console.log(event) // THIS NEEDS TO LOOK FOR THE ID
        navigate(encodeURIComponent(routeId))

        //move the scroll to the useEffect in display route when the route is selected
       // document.getElementById('droppable2scroll')?.scrollTo(0,0)
        //dispatch(setActiveItem(event, itemArray, setActiveAction))
    }

    const renderProgress = (route) => {
        let done = 0
        const customers = Object.values(route.customers)
        customers.forEach(customer => {
            if ((customer.status === 'Done') || (customer.status === 'Skipped')) {
                done++
            }
        })
        const now = done / customers.filter(i => i.active).length * 100
        const display = now === 0 ? 0 : Math.max(now, 10)
        if (now < 100) {
            return (
                <ProgressBar 
                    style={{minWidth:"10px"}}
                    now={display} 
                    label={`${Math.round(now)}%`}
                />
            )
        } else return <p> &#9749;&#127849;</p>
    }    

    return (
        <div style={{margin: "1em"}}>
            {
            (isAllPending || routesPending) ? <Spinner /> : null
            } 
            <div style={{display: "flex", flexWrap: "no-wrap", justifyContent: "space-around", margin: "5px", alignItems:'center',}}>
                <SimpleSelector
                    title="Route"
                    collection='route'
                    collectionPath={`organizations/${organization}/`} 
                    reduxListAction= {REQUEST_ROUTES_SUCCESS}
                    selectedItem={activeRoute}
                    itemArray={routes}
                    setActiveAction={SET_ACTIVE_ROUTE}
                    whichModal="Route"
                    onCreate={onCreate}
                    onEdit={onEdit}
                    onSelect={onSelect}
                    permissions={['Supervisor', 'Admin']}
                    renderItem={renderProgress}                 
                >                 
                </SimpleSelector>
                <RouteEditor />
                <ShiftSetup />                
                <SearchBar />
                {['Supervisor','Admin'].includes(currentUser.claims.role) ? <AdminDropdown /> : null }
            </div>  
            <Outlet/>          
        </div>            
    )
}

export default TopNav