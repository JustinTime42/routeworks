import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import {Button, FormControl, Alert, Modal, Form, Row, Col } from "react-bootstrap"
import SimpleSelector from "../SimpleSelector";
import VehicleTypeEditor from './VehicleTypeEditor'
import { setActiveItem, createItem, deleteItem, editItem, showModal, hideModal, setTempItem } from "../../actions"
import {GET_TRACTORS_SUCCESS, SET_ACTIVE_VEHICLE_TYPE, GET_VEHICLE_TYPES_SUCCESS, SET_ACTIVE_TRACTOR} from '../../constants.js'

const TractorEditor = (props) => {
    const [deleteAlert, setDeleteAlert] = useState('')      
    const activeVehicleType = useSelector(state => state.setActiveVehicleType.activeVehicleType)
    const activeVehicle = useSelector(state => state.setActiveTractor.activeTractor)
    const vehicleTypes = useSelector(state => state.getTractorTypes.tractorTypes)
    const tractors = useSelector(state => state.getTractors.allTractors)
    const modals = useSelector(state => state.whichModals.modals)
    const tempItem = useSelector(state => state.setTempItem.item)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)

    const dispatch = useDispatch()

    useEffect(() => {
        console.log('vehicle types', vehicleTypes)
        const newType = vehicleTypes.find(i => i.name === activeVehicle.type)
        dispatch(setActiveItem(newType, vehicleTypes, SET_ACTIVE_VEHICLE_TYPE))
    },[activeVehicle])

    // Modal handlers for Tractor    
    const onClose = () => {
        dispatch(hideModal('Vehicle'))
        setDeleteAlert(false)
        dispatch(setTempItem(null))
    }

    // Field change handlers for Tractor
    const onChangeName = (event) => {
        dispatch(setTempItem({...tempItem, name: event.target.value}))
    }

    const onChangeActive = () => {
        dispatch(setTempItem({...tempItem, active:!tempItem.active}))
    }

    const onSelectType = (event, itemArray, setActiveAction) => {        
        dispatch(setTempItem({...tempItem, type: event}))
        dispatch(setActiveItem({name:event}, vehicleTypes, SET_ACTIVE_VEHICLE_TYPE))
    }

    // Save change handlers for Tractor
    const onSave = () => {
        if (!tempItem.type) {alert('please enter vehicle type')}
        else {
            if (tempItem.id) {    
                dispatch(editItem(tempItem, tractors, `organizations/${organization}/vehicle`, SET_ACTIVE_TRACTOR, GET_TRACTORS_SUCCESS))
            }
            else {
                dispatch(createItem(tempItem, tractors, `organizations/${organization}/vehicle`, SET_ACTIVE_TRACTOR, GET_TRACTORS_SUCCESS))
            } 
            dispatch(hideModal('Vehicle'))    
        }
    }

    const onDelete = (item) => {
        dispatch(deleteItem(tempItem, tractors, `organizations/${organization}/vehicle`, SET_ACTIVE_TRACTOR, GET_TRACTORS_SUCCESS))
        dispatch(hideModal('Vehicle'))             
    }

    // Modal handlers for vehicle type
    const onCreateType = (whichModal) => {  
        dispatch({type:SET_ACTIVE_VEHICLE_TYPE, payload: {name:'', active:true}})   
        dispatch(showModal(whichModal))
    }

    const onEditType = (item, whichModal) => {
        console.log(item)   
        dispatch(showModal(whichModal))
    }

    const onSaveType = () => {
        if (activeVehicleType.id) {  
            dispatch(editItem(activeVehicleType, vehicleTypes, `organizations/${organization}/vehicle_type`, SET_ACTIVE_VEHICLE_TYPE, GET_VEHICLE_TYPES_SUCCESS))  
        }
        else {
            dispatch(createItem(activeVehicleType, vehicleTypes, `organizations/${organization}/vehicle_type`, SET_ACTIVE_VEHICLE_TYPE, GET_VEHICLE_TYPES_SUCCESS))
        } 
        dispatch(setTempItem({...tempItem, type: activeVehicleType.name}))
        dispatch(hideModal('VehicleType'))    
    }

    const onDeleteType = () => {
        dispatch(deleteItem(activeVehicleType, vehicleTypes, `organizations/${organization}/vehicle_type`, SET_ACTIVE_VEHICLE_TYPE, GET_VEHICLE_TYPES_SUCCESS))
        dispatch(hideModal('VehicleType'))
    }

    // Field change handlers for vehicle type
    const onChangeTypeName = (event) => {
        dispatch({type:SET_ACTIVE_VEHICLE_TYPE, payload: {...activeVehicleType, name:event.target.value}}) 
    }

    const onChangeTypeActive = () => {
        dispatch({type:SET_ACTIVE_VEHICLE_TYPE, payload: {...activeVehicleType, active:!activeVehicleType.active}})
    }

    return (
        <>
        <Modal show={modals.includes('Vehicle')} onHide={onClose}>
            <Modal.Body style={{display: "flex", flexFlow: "column nowrap", justifyContent: "center", alignItems: "center"}}>
                <FormControl style={{width: '50%', margin: "3px"}} size="sm" name="name" type="text" onChange={onChangeName} value={tempItem?.name || ''} />
                <SimpleSelector
                    title="Vehicle Type"
                    selectedItem={activeVehicleType}
                    itemArray={vehicleTypes}   
                    collection='vehicle_type'   
                    collectionPath={`organizations/${organization}/` }            
                    setActiveAction={SET_ACTIVE_VEHICLE_TYPE}
                    reduxListAction= {GET_VEHICLE_TYPES_SUCCESS}
                    whichModal="VehicleType"
                    onCreate={onCreateType}
                    onEdit={onEditType}
                    onSelect={onSelectType}
                    permissions={['Admin']}
                />
                <Form.Group as={Row}>
                    <Col sm={8}>
                        <Form.Check
                            name="active"
                            type="checkbox"
                            label="Active?"
                            checked = {!!tempItem?.active}
                            onChange={onChangeActive}
                        /> 
                    </Col>
                </Form.Group> 
                <div className="flex justify-content-around">
                    <Button variant="danger" style={{visibility: ((deleteAlert !== tempItem?.name) && tempItem) ? "initial" : "hidden"}} onClick={() => setDeleteAlert(tempItem)}>Delete</Button>
                    <Button disabled={!tempItem} style={{margin: "3px"}} onClick={onSave}>Save</Button>   
                    <Button style={{margin: "3px"}} variant="secondary" onClick={onClose}>Close</Button>
                </div>
                <Alert className="d-flex justify-content-around mb-3" show={deleteAlert === tempItem}>
                    <Button onClick={() => onDelete(tempItem)} variant="danger">
                        Delete {tempItem?.name}
                    </Button>
                    <Button onClick={() => setDeleteAlert('')} variant="success">
                        Cancel
                    </Button>
                </Alert>      
            </Modal.Body> 
        </Modal>
        <VehicleTypeEditor onSaveType={onSaveType} onChange={onChangeTypeName} onChangeTypeActive={onChangeTypeActive} vehicleType={activeVehicleType} onDeleteType={onDeleteType}/>
        </>         
    )
}

export default TractorEditor