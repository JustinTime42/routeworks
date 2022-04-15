import React, { useState }  from 'react'
import { useDispatch, useSelector } from "react-redux"
import {Form, Col, Row, Modal, Button } from 'react-bootstrap'
import SimpleSelector from './SimpleSelector'
import DriverEditor from './DriverEditor'
import TractorEditor from './TractorEditor'
import { setActiveItem, setWhichModal } from "../actions"

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
    const whichModal = useSelector(state => state.setWhichModal.whichModal)
    const dispatch = useDispatch()

    const onClearOptions = () => {
        dispatch(setActiveItem(null, drivers, SET_ACTIVE_DRIVER))
        dispatch(setActiveItem(null, tractors, SET_ACTIVE_TRACTOR))
    }
    const onShow = () => {
        dispatch(setWhichModal("Shift"))
        onClearOptions()
    }

    const onCancel = () => {
        onClearOptions()
        dispatch(setWhichModal(null))
    }
    
    const onSave = () => {
        dispatch(setWhichModal(null))
    }
    
    return (
        <div style={{display: "flex", flexWrap: "no-wrap", justifyContent: "space-around", margin: "5px", backgroundColor: "rgba(255, 255, 255,0.1)"}}>
            <div>{activeDriver.name || 'select driver'}</div>
            <Button variant='primary' onClick={onShow}>Edit Shift</Button>
            {/* <div>{{...activeVehicle} || 'select vehicle'}</div> */}
            <Modal show={whichModal === 'Shift'} onHide={() => dispatch(setWhichModal(null))}>
                <Modal.Header closeButton>
                    <Modal.Title>Select Shift Details</Modal.Title>
                </Modal.Header>
                <SimpleSelector
                    title="Driver"
                    selectedItem={activeDriver}
                    itemArray={drivers}
                    createEndpoint="newdriver"
                    editEndpoint="editdriver"
                    deleteEndpoint="deletedriver"
                    updateListAction={GET_DRIVERS_SUCCESS}
                    setActiveAction={SET_ACTIVE_DRIVER} 
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
                <Modal.Footer>
                    <Button variant='primary' onClick={onSave}>Save</Button>
                    <Button variant='secondary' onClick={onCancel}>Cancel</Button>
                </Modal.Footer>
            </Modal>
            <TractorEditor/>
            <DriverEditor />
        </div>        
    )
}

export default ShiftSetup