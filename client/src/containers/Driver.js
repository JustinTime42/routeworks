import React, { useEffect, useState, useContext, useCallback } from 'react'
import { useDispatch, useSelector } from "react-redux";
import SimpleSelector from "../components/SimpleSelector"
import ShiftSetup from '../components/ShiftSetup';
import DriverName from "./DriverSelector"
import DisplayRoute from "./DisplayRoute"
import EditRoute from "./EditRoute"
import EditRouteButton from "./AdminDropdown"
import Spinner from "../components/Spinner"
import { getRouteData, requestAllAddresses, requestRoutes, getTractorTypes, getTractors, getDrivers, setActiveProperty } from "../actions"

import SearchBar from "../components/SearchBar"
import { Alert, Button, DropdownButton } from "react-bootstrap"
import {REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE, SET_ACTIVE_TRACTOR, GET_TRACTORS_SUCCESS, SET_ACTIVE_VEHICLE_TYPE, GET_VEHICLE_TYPES_SUCCESS, GET_DRIVERS_SUCCESS, SET_DRIVER_NAME} from '../constants.js'

import '../styles/driver.css'

const Driver = () => {
    const showRouteEditor = useSelector(state => state.showRouteEditor.showEditor)
    const isRoutePending = useSelector(state => state.getRouteProperties.isPending)
    const isAllPending = useSelector(state => state.requestAllAddresses.isPending)
    const activeDriver = useSelector(state => state.setActiveDriver.driver)
    const drivers = useSelector(state => state.getDrivers.drivers)
    const activeTractor = useSelector(state => state.setActiveTractor.activeTractor)
    const routesPending = useSelector(state => state.requestRoutes.isPending)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routeData = useSelector(state => state.getRouteData.routeData)
    const routes = useSelector(state => state.requestRoutes.routes)
    const tractors = useSelector(state => state.getTractors.allTractors)
    const activeVehicleType = useSelector(state => state.setActiveVehicleType.activeVehicleType)
    const vehicleTypes = useSelector(state => state.getTractorTypes.tractorTypes)
    const dispatch = useDispatch()

    useEffect(() => {
        refreshData()
    },[])

    const refreshData = () => {
        dispatch(requestAllAddresses())
        dispatch(getRouteData())
        dispatch(requestRoutes())
        dispatch(getTractors())
        dispatch(getTractorTypes())
        dispatch(getDrivers())
    }

    return (
        <div style={{margin: "1em"}}>
            {
            (isAllPending || isRoutePending || routesPending) ? <Spinner /> : null
            } 
            <div style={{display: "flex", flexWrap: "no-wrap", justifyContent: "space-around", margin: "5px"}}>
                <SimpleSelector
                    title="Route"
                    selectedItem={activeRoute}
                    itemArray={routes}
                    createEndpoint="addroute"
                    deleteEndpoint="delroute"
                    updateListAction={REQUEST_ROUTES_SUCCESS}
                    setActiveAction={SET_ACTIVE_ROUTE}
                    selectActions={[requestRoutes, requestAllAddresses, getRouteData, setActiveProperty]}
                    // dispatch(requestRoutes())
                    // dispatch(requestAllAddresses())
                    // dispatch(getRouteData())
                    // dispatch(setActiveProperty(null))
                />   
                {/* upgrade driver selector to the simpleSelector component
                <SimpleSelector
                    title="Driver"
                    selectedItem={activeDriver}
                    itemArray={drivers}
                    createEndpoint="newdriver"
                    deleteEndpoint="deletedriver"
                    updateListAction={GET_DRIVERS_SUCCESS}
                    setActiveAction={SET_DRIVER_NAME}
                />                */}
                
                <ShiftSetup />
                <SearchBar />
                <EditRouteButton /> 
                <Button variant="primary" size="sm" onClick={refreshData}>Refresh Data</Button>
            </div>
            { 
            showRouteEditor ? <EditRoute /> : 
            activeTractor.name && (activeDriver.key !== '') ? <DisplayRoute /> :
            <Alert variant="warning">Please enter driver and tractor name to begin.</Alert>                              
            }             
        </div>            
    )
}

export default Driver