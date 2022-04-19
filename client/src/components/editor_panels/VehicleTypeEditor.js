import React, {  useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import {Button, Alert, Modal, Form, Row, Col } from "react-bootstrap"
import { createItem, deleteItem, editItem, setWhichModal, setTempItem } from "../../actions"
import {SET_ACTIVE_VEHICLE_TYPE, GET_VEHICLE_TYPES_SUCCESS} from '../../constants.js'

const VehicleTypeEditor = (props) => {
    const [deleteAlert, setDeleteAlert] = useState('')
    const vehicleTypes = useSelector(state => state.getTractorTypes.tractorTypes)
    const whichModal = useSelector(state => state.setWhichModal.whichModal)
    const tempItem = useSelector(state => state.setTempItem.item)
    const dispatch = useDispatch()

    const onChange = (event) => {
        dispatch(setTempItem({...tempItem, name: event.target.value}))
    }

    const onSave = () => {
        if (tempItem.key === 0) {            
            const {key, ...item} = tempItem 
            dispatch(createItem(item, vehicleTypes, 'newvehicletype', GET_VEHICLE_TYPES_SUCCESS, SET_ACTIVE_VEHICLE_TYPE))
        }
        else {
            dispatch(editItem(tempItem, vehicleTypes, 'editvehicletype', GET_VEHICLE_TYPES_SUCCESS, SET_ACTIVE_VEHICLE_TYPE))
        } 
        dispatch(setWhichModal(null))    
    }

    const onDelete = () => {
        dispatch(deleteItem(tempItem, vehicleTypes, 'deletevehicletype', GET_VEHICLE_TYPES_SUCCESS, SET_ACTIVE_VEHICLE_TYPE))
        dispatch(setWhichModal(null))                 
    }

return (
    <Modal show={whichModal === 'VehicleType'} onHide={() => dispatch(setWhichModal(null))}>
        <Modal.Body style={{display: "flex", flexFlow: "column nowrap", justifyContent: "center", alignItems: "space-between"}}>
            <Form.Group as={Row}>
                        <Form.Label column sm={2}>Name</Form.Label>
                        <Col sm={8}>
                            <Form.Control name="name" type="text" onChange={onChange} placeholder="Name" value={tempItem?.name || ''}/>
                        </Col>
                    </Form.Group>                        
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

export default VehicleTypeEditor