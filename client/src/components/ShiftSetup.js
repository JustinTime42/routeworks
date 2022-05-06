import React, { useState }  from 'react'
import { useDispatch, useSelector } from "react-redux"
import {Form, Col, Row, Modal, Button } from 'react-bootstrap'
import SimpleSelector from './SimpleSelector'
import DriverEditor from './editor_panels/DriverEditor'
import TractorEditor from './editor_panels/TractorEditor'
import WorkTypeEditor from './editor_panels/WorkTypeEditor'
import { setActiveItem, showModal, hideModal, setTempItem } from "../actions"

import {SET_ACTIVE_TRACTOR, SET_ACTIVE_VEHICLE_TYPE, SET_ACTIVE_DRIVER, GET_WORK_TYPES_SUCCESS, SET_WORK_TYPE, SET_ACTIVE_PROPERTY} from '../constants.js'
import { setActiveWorkType } from '../reducers'
import Driver from '../containers/Driver'

const ShiftSetup = () => {
    const activeDriver = useSelector(state => state.setActiveDriver.driver)    
    const activeVehicle = useSelector(state => state.setActiveTractor.activeTractor)
    const drivers = useSelector(state => state.getDrivers.drivers)
    const tractors = useSelector(state => state.getTractors.allTractors)
    const customers = useSelector(state => state.requestAllAddresses.addresses)
    const activeVehicleType = useSelector(state => state.setActiveVehicleType.activeVehicleType)
    const activeWorkType = useSelector(state => state.setActiveWorkType.workType)
    const workTypes = useSelector(state => state.getWorkTypes.allWorkTypes)
    const vehicleTypes = useSelector(state => state.getTractorTypes.tractorTypes)
    const modals = useSelector(state => state.whichModals.modals)
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
        marginLeft: '1em',
        whiteSpace:'nowrap',
        overflow: 'hidden'
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
        dispatch(showModal("Shift"))
        onClearOptions()
        dispatch(setActiveItem(null, customers, SET_ACTIVE_PROPERTY))
    }

    const onCancel = () => {
        onClearOptions()
        dispatch(hideModal("Shift"))
    }
    
    const onSave = () => {
        dispatch(hideModal("Shift"))        
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

    const onSelectVehicle = (event, itemArray, setActiveAction) => {
        let newActive = tractors.find(item => item.key === Number(event))
        dispatch(setActiveItem(Number(event), itemArray, setActiveAction))
        dispatch(setActiveItem(newActive.type, vehicleTypes, SET_ACTIVE_VEHICLE_TYPE))
    }

    return (
        <div style={outerDivStyle}>
            <div style={labelStyle}>{activeDriver.name || 'driver'}</div>
            <div style={labelStyle}>{activeVehicle.name || 'vehicle'}</div>
            <div style={labelStyle}>{activeWorkType.name || 'work type'}</div>
            <Button style={labelStyle} size='sm' variant='primary' onClick={onShow}>Edit Shift</Button>            
            <Modal show={modals.includes('Shift')} onHide={() => dispatch(hideModal('Shift'))}>
                <Modal.Header closeButton>
                    <Modal.Title>Select Shift Details</Modal.Title>
                </Modal.Header>
                <SimpleSelector
                    style={selectorStyle}
                    title="Driver"
                    selectedItem={activeDriver}
                    itemArray={drivers}
                    whichModal="Driver"
                    setActiveAction={SET_ACTIVE_DRIVER}
                    onCreate={onCreate}
                    onEdit={onEdit}
                    onSelect={onSelect}
                />
                <SimpleSelector  
                    style={selectorStyle}
                    title="Vehicle"
                    selectedItem={activeVehicle}
                    itemArray={tractors}                    
                    whichModal="Vehicle"
                    setActiveAction={SET_ACTIVE_TRACTOR}
                    onCreate={onCreate}
                    onEdit={onEdit}
                    onSelect={onSelectVehicle} 
                />
                <SimpleSelector  
                    style={selectorStyle}
                    title="Work Type"
                    selectedItem={activeWorkType}
                    itemArray={workTypes}                   
                    whichModal="WorkType"
                    setActiveAction={SET_WORK_TYPE} 
                    onCreate={onCreate}
                    onEdit={onEdit}
                    onSelect={onSelect}
                />
                <Modal.Footer>
                    <Button variant='primary' onClick={onSave}>Save</Button>
                    <Button variant='secondary' onClick={onCancel}>Cancel</Button>
                </Modal.Footer>
            </Modal>
            <TractorEditor/>
            <DriverEditor />
            <WorkTypeEditor />            
        </div>        
    )
}

export default ShiftSetup