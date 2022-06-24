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

    const onChangeName = (event) => {
        dispatch(setTempItem({...tempItem, name: event.target.value}))
    }

    const onChangeTypeName = (event) => {
        setVehicleType({...vehicleType, name: event.target.value})
    }

    const onChangeActive = () => {
        dispatch(setTempItem({...tempItem, active:!tempItem.active}))
    }

    const onSave = () => {
        if (!activeVehicleType.id) {alert('please enter vehicle type')}
        else {
            let newTractor = {...tempItem, type: activeVehicleType.key}
            console.log(newTractor)
            if (tempItem.key === 0) {            
                const {key, ...item} = newTractor 
                console.log("creating new item", item)
                dispatch(createItem(item, tractors, 'vehicle', GET_TRACTORS_SUCCESS, SET_ACTIVE_TRACTOR))
            }
            else {
                dispatch(editItem(newTractor, tractors, 'vehicle', GET_TRACTORS_SUCCESS, SET_ACTIVE_TRACTOR))
            } 
            dispatch(hideModal('Vehicle'))    
        }
    } 

    const onDelete = (item) => {
        dispatch(deleteItem(tempItem, tractors, "vehicle", GET_TRACTORS_SUCCESS, SET_ACTIVE_TRACTOR))
        dispatch(hideModal('Vehicle'))             
    }

    const onCreateType = (whichModal) => {        
        setVehicleType({name:''})
        dispatch(showModal(whichModal))
    }

    // here I'll alter state.tempItem
    const onEditType = (item, whichModal) => {
        console.log(item)   
        dispatch(showModal(whichModal))
    }
    
    // here I'll select state.activeType
    const onSelectType = (event, itemArray, setActiveAction) => {
        dispatch(setActiveItem(Number(event), itemArray, setActiveAction))
    }

    const onSaveType = () => {
        if (vehicleType.key === 0) {            
            const {key, ...item} = vehicleType 
            dispatch(createItem(item, vehicleTypes, 'newvehicletype', GET_VEHICLE_TYPES_SUCCESS, SET_ACTIVE_VEHICLE_TYPE))
        }
        else {
            dispatch(editItem(vehicleType, vehicleTypes, 'editvehicletype', GET_VEHICLE_TYPES_SUCCESS, SET_ACTIVE_VEHICLE_TYPE))
        } 
        dispatch(hideModal('VehicleType'))    
    }

    const onDeleteType = () => {
        dispatch(deleteItem(vehicleType, vehicleTypes, 'deletevehicletype', GET_VEHICLE_TYPES_SUCCESS, SET_ACTIVE_VEHICLE_TYPE))
        dispatch(hideModal('VehicleType'))                 
    }

    return (
        <>
        <Modal show={modals.includes('Vehicle')} onHide={() => dispatch(hideModal('Vehicle'))}>
            <Modal.Body style={{display: "flex", flexFlow: "column nowrap", justifyContent: "center", alignItems: "center"}}>
                <FormControl style={{width: '50%', margin: "3px"}} size="sm" name="name" type="text" onChange={onChangeName} value={tempItem?.name || ''} />
                <SimpleSelector
                    title="Vehicle Type"
                    selectedItem={activeVehicleType}
                    itemArray={vehicleTypes}   
                    collection='vehicle_type'                
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
                    <Button style={{margin: "3px"}} variant="secondary" onClick={() => dispatch(hideModal('Vehicle'))}>Close</Button>
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
        <VehicleTypeEditor onSaveType={onSaveType} onChange={onChangeTypeName} vehicleType={vehicleType} onDeleteType={onDeleteType}/>
        </>         
    )
}

export default TractorEditor