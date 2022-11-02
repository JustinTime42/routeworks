import React, { useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
import SimpleSelector from "../components/SimpleSelector"
import ShiftSetup from './ShiftSetup';
import RouteEditor from '../components/editor_panels/RouteEditor';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'

import AdminDropdown from "./AdminDropdown"
import Spinner from "../components/Spinner"
import {  setTempItem, showModal, setActiveItem} from "../actions"

import SearchBar from "./SearchBar"
import {REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE, UPDATE_ADDRESSES_FAILED, UPDATE_ADDRESSES_SUCCESS} from '../constants.js'

import '../styles/driver.css'
import Users from '../components/Users';

const TopNav = () => {
    const isRoutePending = useSelector(state => state.getRouteProperties.isPending)
    const isAllPending = useSelector(state => state.requestAllAddresses.isPending)
    const routesPending = useSelector(state => state.requestRoutes.isPending)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routes = useSelector(state => state.requestRoutes.routes)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const dispatch = useDispatch()

    useEffect(() => {
        const unsub = onSnapshot(collection(db, `driver/driver_lists/customer`), (querySnapshot) => {
            dispatch({type: UPDATE_ADDRESSES_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
        })
        return () => {
            unsub()
        }
    },[])

    const sendToDB = async(item) => {
        console.log(item)
        try {
            const docRef = await addDoc(collection(db, 'driver/driver_lists/customer'), {...item})                     
       } catch (e) {
         alert("Error adding document: ", e);
       }
    }

    const onCreate = (whichModal) => {
        dispatch(setTempItem({name: '', active: true, customers: []}))
        dispatch(showModal(whichModal))
    }

    const onEdit = (item, whichModal) => {
        dispatch(setTempItem(item))
        dispatch(showModal(whichModal))
    }
    
    const onSelect = (event, itemArray, setActiveAction) => {
        console.log(event)
        dispatch(setActiveItem(event, itemArray, setActiveAction))
      //  dispatch(setActiveItem({}, customers, SET_ACTIVE_PROPERTY))
    }

    return (
        <div style={{margin: "1em"}}>
            {
            (isAllPending || isRoutePending || routesPending) ? <Spinner /> : null
            } 
            <div style={{display: "flex", flexWrap: "no-wrap", justifyContent: "space-around", margin: "5px", alignItems:'center',}}>
                <SimpleSelector
                    title="Route"
                    collection='route'
                    collectionPath='driver/driver_lists/'
                    reduxListAction= {REQUEST_ROUTES_SUCCESS}
                    selectedItem={activeRoute}
                    itemArray={routes}
                    setActiveAction={SET_ACTIVE_ROUTE}
                    whichModal="Route"
                    onCreate={onCreate}
                    onEdit={onEdit}
                    onSelect={onSelect}
                />
                <RouteEditor />
                <ShiftSetup />                
                <SearchBar />
                {/* <UserEditor /> */}
                {['Supervisor','Admin'].includes(currentUser.claims.role) ? <AdminDropdown /> : null }
                {/* <Button variant="primary" size="sm" onClick={refreshData2}>Refresh</Button> */}
            </div>
        </div>            
    )
}

export default TopNav