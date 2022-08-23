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
import { Alert, Button } from "react-bootstrap"
import {REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE, UPDATE_ADDRESSES_FAILED, UPDATE_ADDRESSES_SUCCESS} from '../constants.js'

import '../styles/driver.css'
import UserEditor from '../components/editor_panels/UserEditor';

const TopNav = () => {
    const showRouteEditor = useSelector(state => state.showRouteEditor.showEditor)
    const isRoutePending = useSelector(state => state.getRouteProperties.isPending)
    const isAllPending = useSelector(state => state.requestAllAddresses.isPending)

    const routesPending = useSelector(state => state.requestRoutes.isPending)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routes = useSelector(state => state.requestRoutes.routes)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const dispatch = useDispatch()

    // useEffect(() => {
    //     refreshData()
    // },[])

    
    // get all customers
    useEffect(() => {
        const unsub = onSnapshot(collection(db, `driver/driver_lists/customer`), (querySnapshot) => {
            dispatch({type: UPDATE_ADDRESSES_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
        })
        return () => {
            unsub()
        }
    },[])

    const refreshData2 = () => {
        fetch(`${process.env.REACT_APP_API_URL}/properties`)
        .then(response => response.json())
        .then(data => {
            dispatch({ type: UPDATE_ADDRESSES_SUCCESS, payload: data})
            let newCustomerArray = []
            data.forEach(item => {
            let newItem = {                   
                    cust_name: item.cust_name,
                    cust_fname: item.cust_fname,
                    cust_lname: item.cust_lname,
                    cust_phone: item.cust_phone,
                    surfaceType: item.surfaceType,
                    is_new: item.is_new,
                    notes: item.notes,
                    active: !item.inactive,
                    temp: item.temp,                    
                    cust_email: item.cust_email,
                    cust_email2: item.cust_email2,
                    include_email2: item.include_email2,
                    address: item.address,
                    service_city: item.city,
                    service_state: item.state,
                    service_zip: item.zip,
                    bill_address: item.bill_address,
                    bill_city: item.bill_city,
                    bill_state: item.bill_state,
                    bill_zip: item.bill_zip,
                    tags: item.tags,
                    service_level: item.service_level,
                    snow_price: item.price,
                    sand_price: item.price,
                    sweep_price: item.price,
                    value: item.value,
                    price_per_yard: item.price_per_yard,
                    season_price: item.season_price,
                    contract_type: item.contract_type,
                    sand_contract_type: item.sand_contract,
                    Sander: item.Sander,
                    'Work Truck (1 laborer)': item['Work Truck (1 laborer)'],
                    'Tractor with snow blower': item['Tractor with snow blower'],
                    'Sidewalk snow blower': item['Sidewalk snow blower'],
                    'Vacuum sweeper truck': item['Vacuum sweeper truck'],
                    Plow: item.Plow,
                    'Grader AWD': item['Grader AWD'],
                    'Water Truck - Small': item['Water Truck - Small '],
                    Laborer: item.Laborer,
                    'Asphalt Patching': item['Asphalt Patching'],
                    'Compact Track Loader': item['Compact Track Loader'],
                    'Dump Truck - small': item['Dump Truck - small'],
                    'Excavator - Small': item['Excavator - Small'],
                    'Water Truck - 2000 gal': item['Water Truck - 2000 gal'],
                    'Vibratory Roller': item['Vibratory Roller'],
            }            
            let keysArray = Object.keys(newItem)
            keysArray.forEach(i => {
                if (newItem[i] === null || newItem[i] === undefined) {
                    delete newItem[i]
                }
            })             
            newCustomerArray.push(newItem)
        })
        console.log(newCustomerArray)
        // push entire batch of documents to admin/admin_lists/customer
        newCustomerArray.forEach(item => {
            
            sendToDB(item)
        })
        } )
        .catch(error => dispatch({ type: UPDATE_ADDRESSES_FAILED, payload: error}))
        

        /*gonna use this temporarily to move data to new database
        old structure: {item}
        new structure: {nonAdminFields: {}, adminFields{pricing stuff}}
        for each customer in customers, 
        */
    //     dispatch(requestAllAddresses())
    //     dispatch(getRouteData())
    //    // dispatch(requestRoutes())
    //     dispatch(getTractors())
    //     dispatch(getTractorTypes())
    //     //dispatch(getDrivers())
    //     dispatch(getWorkTypes())
    }

    const sendToDB = async(item) => {
        console.log(item)
        try {
            const docRef = await addDoc(collection(db, 'driver/driver_lists/customer'), {...item})                     
       } catch (e) {
         alert("Error adding document: ", e);
       }
    }

    const onCreate = (whichModal) => {
        dispatch(setTempItem({}))
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
                { currentUser.admin ? <AdminDropdown /> : null }
                 
                {/* <Button variant="primary" size="sm" onClick={refreshData2}>Refresh</Button> */}
            </div>
        </div>            
    )
}

export default TopNav