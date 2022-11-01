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
    const [vehicleType, setVehicleType] = useState(activeVehicleType)
    const vehicleTypes = useSelector(state => state.getTractorTypes.tractorTypes)
    const tractors = useSelector(state => state.getTractors.allTractors)
    const modals = useSelector(state => state.whichModals.modals)
    const tempItem = useSelector(state => state.setTempItem.item)
    const dispatch = useDispatch()

    useEffect(() => {
        console.log("vehicle type", props.vehicleType)
        setVehicleType(activeVehicleType)
    },[activeVehicleType])

    useEffect(() => {
        if(!tempItem && modals.includes('Vehicle')) {
            dispatch(setTempItem({name: '', active: true}))
        }
        if(tempItem?.type) {
            dispatch(setActiveItem(tempItem.type, vehicleTypes, SET_ACTIVE_VEHICLE_TYPE))
        }
    }, [tempItem])

    const onChangeName = (event) => {
        dispatch(setTempItem({...tempItem, name: event.target.value}))
    }

    const onChangeTypeName = (event) => {
        setVehicleType({...vehicleType, name: event.target.value})
    }

    const onChangeActive = () => {
        dispatch(setTempItem({...tempItem, active:!tempItem.active}))
    }

    const onChangeTypeActive = () => {
        setVehicleType({...vehicleType, active: !vehicleType.active})
    }

    const onClose = () => {
        dispatch(hideModal('Vehicle'))
        setDeleteAlert(false)
        dispatch(setTempItem(null))
    }

    const onSave = () => {
        if (!activeVehicleType.id) {alert('please enter vehicle type')}
        else {
            let newTractor = {...tempItem, type: activeVehicleType}
            console.log(newTractor)
            if (tempItem.id) {    
                dispatch(editItem(tempItem, tractors, 'driver/driver_lists/vehicle', SET_ACTIVE_TRACTOR, GET_TRACTORS_SUCCESS))
            }
            else {
                dispatch(createItem(tempItem, tractors, 'driver/driver_lists/vehicle', SET_ACTIVE_TRACTOR, GET_TRACTORS_SUCCESS))
            } 
            dispatch(hideModal('Vehicle'))    
        }
    } 

    const onDelete = (item) => {
        dispatch(deleteItem(tempItem, tractors, "driver/driver_lists/vehicle", SET_ACTIVE_TRACTOR, GET_TRACTORS_SUCCESS))
        dispatch(hideModal('Vehicle'))             
    }

    const onCreateType = (whichModal) => {        
        setVehicleType({name:'', active:true})
        dispatch(showModal(whichModal))
    }
    
    // maybe here I can setTempItem(...tempItem, type: event)
    const onSelectType = (event, itemArray, setActiveAction) => {
        dispatch(setActiveItem(event, itemArray, setActiveAction))
        dispatch(setTempItem({...tempItem, type: event}))
    }

    const onEditType = (item, whichModal) => {
        console.log(item)   
        dispatch(showModal(whichModal))
    }

    const onSaveType = () => {
        if (vehicleType.id) {  
            dispatch(editItem(vehicleType, vehicleTypes, 'driver/driver_lists/vehicle_type', SET_ACTIVE_VEHICLE_TYPE, GET_VEHICLE_TYPES_SUCCESS))  
        }
        else {
            dispatch(createItem(vehicleType, vehicleTypes, 'driver/driver_lists/vehicle_type', SET_ACTIVE_VEHICLE_TYPE, GET_VEHICLE_TYPES_SUCCESS))
        } 
        dispatch(hideModal('VehicleType'))    
    }

    const onDeleteType = () => {
        dispatch(deleteItem(vehicleType, vehicleTypes, 'driver/driver_lists/vehicle_type', GET_VEHICLE_TYPES_SUCCESS, SET_ACTIVE_VEHICLE_TYPE))
        dispatch(hideModal('VehicleType'))                 
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
                    collectionPath='driver/driver_lists/'             
                    setActiveAction={SET_ACTIVE_VEHICLE_TYPE}
                    reduxListAction= {GET_VEHICLE_TYPES_SUCCESS}
                    whichModal="VehicleType"
                    onCreate={onCreateType}
                    onEdit={onEditType}
                    onSelect={onSelectType}
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
        <VehicleTypeEditor onSaveType={onSaveType} onChange={onChangeTypeName} onChangeTypeActive={onChangeTypeActive} vehicleType={vehicleType} onDeleteType={onDeleteType}/>
        </>         
    )
}

export default TractorEditor