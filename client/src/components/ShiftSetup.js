import React, { useState }  from 'react'
import { useDispatch, useSelector } from "react-redux"
import {Form, Col, Row } from 'react-bootstrap'
import SimpleSelector from './SimpleSelector'
import DriverEditor from './DriverEditor'
import TractorEditor from './TractorEditor'

import {SET_ACTIVE_TRACTOR, GET_TRACTORS_SUCCESS, SET_ACTIVE_VEHICLE_TYPE, GET_VEHICLE_TYPES_SUCCESS, GET_DRIVERS_SUCCESS, SET_ACTIVE_DRIVER} from '../constants.js'
import { setActiveWorkType } from '../reducers'
import Driver from '../containers/Driver'

const ShiftSetup = () => {
    const activeDriver = useSelector(state => state.setActiveDriver.driver)    
    const activeVehicle = useSelector(state => state.setActiveTractor.activeTractor)
    const drivers = useSelector(state => state.getDrivers.drivers)
    const tractors = useSelector(state => state.getTractors.allTractors)
    const activeVehicleType = useSelector(state => state.setActiveVehicleType.activeVehicleType)
    const vehicleTypes = useSelector(state => state.getTractorTypes.tractorTypes)
    const dispatch = useDispatch()

    //basically I just moved this stuff to its own component in prep for this new layout
    // next, move the guts into a modal, and replace the top line presentation to labels showing the active
    return (
        <div style={{display: "flex", flexWrap: "no-wrap", justifyContent: "space-around", margin: "5px", backgroundColor: "rgba(255, 255, 255,0.1)"}}>
            <div>{activeDriver.name || 'select driver'}</div>
            {/* <div>{{...activeVehicle} || 'select vehicle'}</div> */}
            <SimpleSelector
                title="Driver"
                selectedItem={activeDriver}
                itemArray={drivers}
                createEndpoint="newdriver"
                editEndpoint="editdriver"
                deleteEndpoint="deletedriver"
                updateListAction={GET_DRIVERS_SUCCESS}
                setActiveAction={SET_ACTIVE_DRIVER} // change this constant to match pattern with the rest
                whichModal="Driver"
            />
            <SimpleSelector  
                title="Vehicle"
                selectedItem={activeVehicle}
                itemArray={tractors}
                createEndpoint="newvehicle"
                deleteEndpoint="deletevehicle"
                updateListAction={GET_TRACTORS_SUCCESS}
                setActiveAction={SET_ACTIVE_TRACTOR}
                additionalFields={{type: activeVehicleType.name}}
                showAdditionalFields={true}
                whichModal="Vehicle" 
            />
            <TractorEditor/>
            <DriverEditor />
        </div>        
    )
}

export default ShiftSetup