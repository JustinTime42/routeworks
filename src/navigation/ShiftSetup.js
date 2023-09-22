import React, { useState, useEffect }  from 'react'
import { useDispatch, useSelector } from "react-redux"
import { useAuthState } from "react-firebase-hooks/auth"
import { useLocation, useNavigate } from 'react-router-dom'
import { collection, onSnapshot } from "firebase/firestore";
import { db } from '../firebase' 
//import firebase from 'firebase/compat'
import {logout, auth} from '../firebase'
import {Form, Col, Row, Modal, Button } from 'react-bootstrap'
import SimpleSelector from '../components/SimpleSelector'
//import DriverEditor from '../components/editor_panels/UserEditor'
import TractorEditor from '../components/editor_panels/TractorEditor'
import {getAdminItem} from '../firebase'
import WorkTypeEditor from '../components/editor_panels/WorkTypeEditor'
import { setActiveItem, showModal, hideModal, setTempItem, setCurrentUser, clearState, setColorMode } from "../actions"

import {SET_ACTIVE_TRACTOR, GET_TRACTORS_SUCCESS, SET_ACTIVE_VEHICLE_TYPE, GET_DRIVERS_SUCCESS, SET_ACTIVE_DRIVER, GET_WORK_TYPES_SUCCESS, SET_WORK_TYPE, SET_ACTIVE_PROPERTY, USER_LOGOUT, COLOR_MODE} from '../constants.js'

const ShiftSetup = () => {
    const [user, loading, error] = useAuthState(auth);
    let location = useLocation()

   // const activeDriver = useSelector(state => state.setActiveDriver.driver)    
    const activeVehicle = useSelector(state => state.setActiveTractor.activeTractor)
    const tractors = useSelector(state => state.getTractors.allTractors)
    const customers = useSelector(state => state.requestAllAddresses.addresses)
    const activeVehicleType = useSelector(state => state.setActiveVehicleType.activeVehicleType)
    const activeWorkType = useSelector(state => state.setActiveWorkType.workType)
    const workTypes = useSelector(state => state.getWorkTypes.allWorkTypes)
    const vehicleTypes = useSelector(state => state.getTractorTypes.tractorTypes)
    const modals = useSelector(state => state.whichModals.modals)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const colorMode = useSelector(state => state.setColorMode.colorMode)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    

    useEffect(() => { 
        const unsub = onSnapshot(collection(db, 'driver/driver_lists/driver'), (querySnapshot) => {
            dispatch({type:GET_DRIVERS_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
        })
        return () => {
            unsub()
        }
    },[])

    useEffect(() => {
        // change data_bs_theme to light or dark depending on colorMode
        document.body.setAttribute('data-bs-theme', colorMode)
    },[colorMode])
    

    const outerDivStyle = {
        display: "flex", 
        flexWrap: "no-wrap",
        alignItems:'center',
        justifyContent: "space-around",
        margin: "5px",
        backgroundColor: "rgba(255, 255, 255,0.1)",
        borderRadius:"5px",
        width: '50%'
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
        dispatch(setActiveItem(null, tractors, SET_ACTIVE_TRACTOR))
        dispatch(setActiveItem(null, workTypes, SET_WORK_TYPE))        
    }
    const onShow = () => {
        dispatch(showModal("Shift"))
        onClearOptions()
    }

    const onCancel = () => {
        onClearOptions()
        dispatch(hideModal("Shift"))
    }
    
    const onSave = () => {
        dispatch(hideModal("Shift"))        
    }

    const onCreate = (whichModal) => {        
        dispatch(setTempItem({name: '', active: true}))
        dispatch(showModal(whichModal))
    }

    const onEdit = (item, whichModal) => {
        dispatch(setTempItem(item))
        dispatch(showModal(whichModal))
    }
    
    const onSelect = (event, itemArray, setActiveAction) => {
        console.log(event)
        dispatch(setActiveItem(event, itemArray, setActiveAction))
    }

    const onSelectVehicle = (event, itemArray, setActiveAction) => {
        let newActive = tractors.find(item => item.id === Number(event))
        console.log(event)
        //dispatch(setActiveItem(newActive?.type, vehicleTypes, SET_ACTIVE_VEHICLE_TYPE))
        dispatch(setActiveItem(event, itemArray, setActiveAction))
    }

    const handleLogout = () => {        
        // this doesn't work as expected because this component unmounts when the modal is hidden 
        // and doesn't execute the rest of the function, and can't navigate with the modal open
        // solution: look at Router and see how to handle this at the top level routes, like redirecting to login page if no auth
        dispatch(hideModal("Shift")) 
        dispatch(clearState())
        console.log("logging out")
        logout()      
        navigate('/login')
    };

    return (
        <div style={outerDivStyle}>
            <div style={labelStyle}>{currentUser.claims.name || 'driver'}</div>
            <div style={labelStyle}>{activeVehicle.name || 'vehicle'}</div>
            <div style={labelStyle}>{activeWorkType.name || 'work type'}</div>
            <Button style={labelStyle} size='sm' variant='primary' onClick={onShow}>Options</Button>            
            <Modal style={{textAlign:'center'}} show={modals.includes('Shift')} onHide={() => dispatch(hideModal('Shift'))}>
                <Modal.Header closeButton>
                    <div>
                    <Form.Check
                        type="switch"
                        id="color-mode"
                        checked={colorMode === 'dark'}
                        label={colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        onClick={() => dispatch(setColorMode(colorMode === 'dark' ? 'light' : 'dark'))}
                    />
                    </div>                    
                </Modal.Header>
                <div style={{...labelStyle, marginTop: '1em'}}>{currentUser.claims.name}</div>
                <Modal.Title>Select Shift Details</Modal.Title>
                <SimpleSelector  
                    style={selectorStyle}
                    title="Vehicle"
                    collection='vehicle'
                    collectionPath={`organizations/${organization}/`}
                    selectedItem={activeVehicle}
                    itemArray={tractors}                    
                    whichModal="Vehicle"
                    setActiveAction={SET_ACTIVE_TRACTOR}
                    reduxListAction= {GET_TRACTORS_SUCCESS}
                    onCreate={onCreate}
                    onEdit={onEdit}
                    onSelect={onSelectVehicle} 
                    permissions={['Admin']}
                />
                <SimpleSelector  
                    style={selectorStyle}
                    title="Work Type"
                    collection='work_type'
                    collectionPath={`organizations/${organization}/`}
                    selectedItem={activeWorkType}
                    itemArray={workTypes}              
                    whichModal="WorkType"
                    setActiveAction={SET_WORK_TYPE} 
                    reduxListAction= {GET_WORK_TYPES_SUCCESS}
                    onCreate={onCreate}
                    onEdit={onEdit}
                    onSelect={onSelect}
                    permissions={['Admin']}
                />
                <Modal.Footer>
                    <Button variant='primary' onClick={handleLogout}>Log Out</Button>
                    <Button variant='primary' onClick={onSave}>Save</Button>
                    <Button variant='secondary' onClick={onCancel}>Cancel</Button>
                </Modal.Footer>
            </Modal>
            <TractorEditor/>
            <WorkTypeEditor />            
        </div>        
    )
}

export default ShiftSetup