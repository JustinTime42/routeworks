import React, { useState }  from 'react'
import { useDispatch, useSelector } from "react-redux"
import {Form, Col, Row, Modal, Button } from 'react-bootstrap'
import SimpleSelector from './SimpleSelector'
import DriverEditor from './editor_panels/DriverEditor'
import TractorEditor from './editor_panels/TractorEditor'
import WorkTypeEditor from './editor_panels/WorkTypeEditor'
import VehicleTypeEditor from './editor_panels/VehicleTypeEditor'
import { setActiveItem, setWhichModal } from "../actions"

import {SET_ACTIVE_TRACTOR, GET_TRACTORS_SUCCESS, GET_DRIVERS_SUCCESS, SET_ACTIVE_DRIVER, GET_WORK_TYPES_SUCCESS, SET_WORK_TYPE} from '../constants.js'
import { setActiveWorkType } from '../reducers'
import Driver from '../containers/Driver'

const ShiftSetup = () => {
    const activeDriver = useSelector(state => state.setActiveDriver.driver)    
    const activeVehicle = useSelector(state => state.setActiveTractor.activeTractor)
    const drivers = useSelector(state => state.getDrivers.drivers)
    const tractors = useSelector(state => state.getTractors.allTractors)
    const activeVehicleType = useSelector(state => state.setActiveVehicleType.activeVehicleType)
    const activeWorkType = useSelector(state => state.setActiveWorkType.workType)
    const workTypes = useSelector(state => state.getWorkTypes.allWorkTypes)
  //  const vehicleTypes = useSelector(state => state.getTractorTypes.tractorTypes)
    const whichModal = useSelector(state => state.setWhichModal.whichModal)
    const dispatch = useDispatch()

    const outerDivStyle = {
        display: "flex", 
        flexWrap: "no-wrap",
        alignItems:'center',
        justifyContent: "space-around",
        margin: "5px",
        backgroundColor: "rgba(255, 255, 255,0.1)",
        borderRadius:"5px"
    }

    const labelStyle = {
        marginRight: '1em',
        marginLeft: '1em'
    }

    const selectorStyle = {
        margin: '1em'
    }

    const onClearOptions = () => {
        dispatch(setActiveItem(null, drivers, SET_ACTIVE_DRIVER))
        dispatch(setActiveItem(null, tractors, SET_ACTIVE_TRACTOR))
        dispatch(setActiveItem(null, workTypes, SET_WORK_TYPE))
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
        <div style={outerDivStyle}>
            <div style={labelStyle}>{activeDriver.name || 'driver'}</div>
            <div style={labelStyle}>{activeVehicle.name || 'vehicle'}</div>
            <div style={labelStyle}>{activeWorkType.name || 'work type'}</div>
            <Button size='sm' variant='primary' onClick={onShow}>Edit Shift</Button>            
            <Modal show={whichModal === 'Shift'} onHide={() => dispatch(setWhichModal(null))}>
                <Modal.Header closeButton>
                    <Modal.Title>Select Shift Details</Modal.Title>
                </Modal.Header>
                <SimpleSelector
                    style={selectorStyle}
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
                    style={selectorStyle}
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
                <SimpleSelector  
                    style={selectorStyle}
                    title="Work Type"
                    selectedItem={activeWorkType}
                    itemArray={workTypes}
                    createEndpoint="newworktype"
                    deleteEndpoint="deleteworktype"
                    updateListAction={GET_WORK_TYPES_SUCCESS}
                    setActiveAction={SET_WORK_TYPE}
                    showAdditionalFields={true}
                    whichModal="WorkType" 
                />
                <Modal.Footer>
                    <Button variant='primary' onClick={onSave}>Save</Button>
                    <Button variant='secondary' onClick={onCancel}>Cancel</Button>
                </Modal.Footer>
            </Modal>
            <TractorEditor/>
            <DriverEditor />
            <WorkTypeEditor />
            <VehicleTypeEditor />
        </div>        
    )
}

export default ShiftSetup