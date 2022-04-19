import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import {Button, FormControl, Alert, Modal } from "react-bootstrap"
import SimpleSelector from "../SimpleSelector";
import { setActiveItem, createItem, deleteItem, editItem, setWhichModal, setTempItem } from "../../actions"
import {GET_TRACTORS_SUCCESS, SET_ACTIVE_VEHICLE_TYPE, GET_VEHICLE_TYPES_SUCCESS, SET_ACTIVE_TRACTOR} from '../../constants.js'

const TractorEditor = (props) => {
    const [deleteAlert, setDeleteAlert] = useState('')
    const activeVehicleType = useSelector(state => state.setActiveVehicleType.activeVehicleType)
    const vehicleTypes = useSelector(state => state.getTractorTypes.tractorTypes)
    const tractors = useSelector(state => state.getTractors.allTractors)
    const whichModal = useSelector(state => state.setWhichModal.whichModal)
    const tempItem = useSelector(state => state.setTempItem.item)
    const dispatch = useDispatch()
    
    useEffect(() => {        
        dispatch(setTempItem({...tempItem, type: activeVehicleType.key}))
    }, [activeVehicleType])

    const onChangeName = (event) => {
        dispatch(setTempItem({...tempItem, name: event.target.value}))
    }
    
    const onSave = () => {
         if (tempItem.key === 0) {            
             const {key, ...item} = tempItem 
             console.log("creating new item", item)
             dispatch(createItem(item, tractors, 'newvehicle', GET_TRACTORS_SUCCESS, SET_ACTIVE_TRACTOR))
         }
         else {
             dispatch(editItem(tempItem, tractors, 'editvehicle', GET_TRACTORS_SUCCESS, SET_ACTIVE_TRACTOR))
         } 
         dispatch(setWhichModal(null))    
    } 

    const onDelete = (item) => {
        dispatch(deleteItem(tempItem, tractors, "deletevehicle", GET_TRACTORS_SUCCESS, SET_ACTIVE_TRACTOR))
        dispatch(setWhichModal(null))             
    }



    return (
        <Modal show={whichModal === 'Vehicle'} onHide={() => dispatch(setWhichModal(null))}>
            <Modal.Body style={{display: "flex", flexFlow: "column nowrap", justifyContent: "center", alignItems: "center"}}>
                <FormControl style={{width: '50%', margin: "3px"}} size="sm" name="name" type="text" onChange={onChangeName} value={tempItem?.name || ''} />
                <SimpleSelector
                    title="Vehicle Type"
                    selectedItem={activeVehicleType}
                    itemArray={vehicleTypes}
                    createEndpoint="newvehicletype"
                    deleteEndpoint="deletevehicletype"
                    updateListAction={GET_VEHICLE_TYPES_SUCCESS}
                    setActiveAction={SET_ACTIVE_VEHICLE_TYPE}
                    whichModal="VehicleType"
                />
                <div className="flex justify-content-around">
                    <Button variant="danger" style={{visibility: ((deleteAlert !== tempItem?.name) && tempItem) ? "initial" : "hidden"}} onClick={() => setDeleteAlert(tempItem)}>Delete</Button>
                    <Button disabled={!tempItem} style={{margin: "3px"}} onClick={onSave}>Save</Button>   
                    <Button style={{margin: "3px"}} variant="secondary" onClick={() => dispatch(setWhichModal(null))}>Close</Button>
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
    )
}

export default TractorEditor