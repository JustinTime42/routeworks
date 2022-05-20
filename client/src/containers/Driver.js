import React, { useEffect, useState, useContext, useCallback } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { useParseQuery } from  '@parse/react';
import Parse from 'parse/dist/parse.min.js';
import SimpleSelector from "../components/SimpleSelector"
import ShiftSetup from '../components/ShiftSetup';
import RouteEditor from '../components/editor_panels/RouteEditor';

import DisplayRoute from "./DisplayRoute"
import EditRoute from "./EditRoute"
import EditRouteButton from "./AdminDropdown"
import Spinner from "../components/Spinner"
import { getRouteData, requestAllAddresses, requestRoutes, getTractorTypes, getTractors, getDrivers, getWorkTypes, setTempItem, showModal, setActiveItem} from "../actions"

import SearchBar from "../components/SearchBar"
import { Alert, Button, DropdownButton } from "react-bootstrap"
import {REQUEST_ROUTES_SUCCESS, SET_ACTIVE_PROPERTY, SET_ACTIVE_ROUTE} from '../constants.js'

import '../styles/driver.css'

const Driver = () => {
    const showRouteEditor = useSelector(state => state.showRouteEditor.showEditor)
    const isRoutePending = useSelector(state => state.getRouteProperties.isPending)
    const isAllPending = useSelector(state => state.requestAllAddresses.isPending)
    const activeDriver = useSelector(state => state.setActiveDriver.driver)
    const customers = useSelector(state => state.requestAllAddresses.addresses)
    const activeTractor = useSelector(state => state.setActiveTractor.activeTractor)
    const routesPending = useSelector(state => state.requestRoutes.isPending)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routes = useSelector(state => state.requestRoutes.routes)
    const activeWorkType = useSelector(state => state.setActiveWorkType.workType)
    const dispatch = useDispatch()

    useEffect(() => {
        refreshData()
    },[])

    const refreshData = () => {
        dispatch(requestAllAddresses())
        dispatch(getRouteData())
       // dispatch(requestRoutes())
        dispatch(getTractors())
        dispatch(getTractorTypes())
        dispatch(getDrivers())
        dispatch(getWorkTypes())
    }

    const onCreate = (whichModal) => {
        dispatch(setTempItem({}))
        dispatch(showModal(whichModal))
    }

    const onEdit = (item, whichModal) => {
        console.log(item)        
        dispatch(setTempItem(item))
        dispatch(showModal(whichModal))
    }
    
    const onSelect = (event, itemArray, setActiveAction) => {
        dispatch(setActiveItem(event, itemArray, setActiveAction))
        dispatch(setActiveItem(null, customers, SET_ACTIVE_PROPERTY))
    }

    return (
        <div style={{margin: "1em"}}>
            {
            (isAllPending || isRoutePending || routesPending) ? <Spinner /> : null
            } 
            <div style={{display: "flex", flexWrap: "no-wrap", justifyContent: "space-around", margin: "5px", alignItems:'center',}}>
                <SimpleSelector
                    title="Route"
                    className='route'
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
                {/* <ShiftSetup />                 */}
                <SearchBar />
                {/* <EditRouteButton />  */}
                <Button variant="primary" size="sm" onClick={refreshData}>Refresh</Button>
            </div>
            { 
            showRouteEditor ? <EditRoute /> : 
            activeTractor.name && (activeDriver.key !== '')  && activeWorkType.name ? <DisplayRoute /> :
            <Alert variant="warning">Please select route, driver, vehicle, and work type to begin.</Alert>                              
            }             
        </div>            
    )
}

export default Driver