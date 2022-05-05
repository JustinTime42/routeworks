import React, { useEffect, useState, useContext, useCallback } from 'react'
import { useDispatch, useSelector } from "react-redux";
import SimpleSelector from "../components/SimpleSelector"
import ShiftSetup from '../components/ShiftSetup';
import RouteEditor from '../components/editor_panels/RouteEditor';

import DisplayRoute from "./DisplayRoute"
import EditRoute from "./EditRoute"
import EditRouteButton from "./AdminDropdown"
import Spinner from "../components/Spinner"
import { getRouteData, requestAllAddresses, requestRoutes, getTractorTypes, getTractors, getDrivers, getWorkTypes, setTempItem, showModal, hideModal, setActiveItem} from "../actions"

import SearchBar from "../components/SearchBar"
import { Alert, Button, DropdownButton } from "react-bootstrap"
import {REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE, SET_ACTIVE_TRACTOR, GET_TRACTORS_SUCCESS, SET_ACTIVE_VEHICLE_TYPE, GET_VEHICLE_TYPES_SUCCESS, GET_DRIVERS_SUCCESS, SET_ACTIVE_DRIVER} from '../constants.js'

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
    const activeWorkType = useSelector(state => state.setActiveWorkType.workType)
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
        dispatch(getWorkTypes())
    }

    const onCreate = (whichModal) => {
        dispatch(setTempItem({key:0}))
        dispatch(showModal(whichModal))
    }

    const onEdit = (item, whichModal) => {
        console.log(item)        
        dispatch(setTempItem(item))
        dispatch(showModal(whichModal))
    }
    
    const onSelect = (event, itemArray, setActiveAction) => {
        dispatch(setActiveItem(Number(event), itemArray, setActiveAction))
    }

    return (
        <div style={{margin: "1em"}}>
            {
            (isAllPending || isRoutePending || routesPending) ? <Spinner /> : null
            } 
            <div style={{display: "flex", flexWrap: "no-wrap", justifyContent: "space-around", margin: "5px", alignItems:'center',}}>
                <SimpleSelector
                    title="Route"
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
                <EditRouteButton /> 
                <Button variant="primary" size="sm" onClick={refreshData}>Refresh</Button>
            </div>
            { 
            showRouteEditor ? <EditRoute /> : 
            activeTractor.name && (activeDriver.key !== '')  && activeRoute.name && activeWorkType.name ? <DisplayRoute /> :
            <Alert variant="warning">Please select route, driver, vehicle, and work type to begin.</Alert>                              
            }             
        </div>            
    )
}

export default Driver