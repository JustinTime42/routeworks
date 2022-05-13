import React, {  useState, useEffect  } from "react"
import { useDispatch, useSelector } from "react-redux";
import {Button, Alert, Modal, Form, Row, Col } from "react-bootstrap"
import { createItem, deleteItem, editItem, showModal, hideModal, setTempItem } from "../../actions"
import {SET_ACTIVE_VEHICLE_TYPE, GET_VEHICLE_TYPES_SUCCESS} from '../../constants.js'


// this might need to be a child of TractorEditor rather than ShiftEditor
// and I might need to put the 
const VehicleTypeEditor = (props) => {
    const [deleteAlert, setDeleteAlert] = useState('')
    // const vehicleTypes = useSelector(state => state.getTractorTypes.tractorTypes)
    const modals = useSelector(state => state.whichModals.modals)
    // const tempItem = useSelector(state => state.setTempItem.item)
    const dispatch = useDispatch()

    useEffect(() => {
        console.log("vehicle type", props.vehicleType)

    },[props.vehicleType])

    const onHide = () => dispatch(hideModal('VehicleType'))

return (
    <Modal show={modals.includes('VehicleType')} onHide={onHide}>
        <Modal.Body style={{display: "flex", flexFlow: "column nowrap", justifyContent: "center", alignItems: "space-between"}}>
            <Form.Group as={Row}>
                <Form.Label column sm={2}>Name</Form.Label>
                <Col sm={8}>
                    <Form.Control name="name" type="text" onChange={props.onChange} placeholder="Name" value={props.vehicleType?.name || ''}/>
                </Col>
            </Form.Group>  
            {/* <Form.Group as={Row}>
                <Form.Label column sm={2}>Active</Form.Label>
                <Col sm={8}>
                    <Form.Check
                        name="active"
                        type="checkbox"
                        label="Active?"
                        checked = {!!props.vehicleType?.active}
                        onChange={props.onChangeTypeActive}
                    /> 
                </Col>
            </Form.Group>                        */}
            <div className="flex justify-content-around">
                <Button variant="danger" style={{visibility: ((deleteAlert !== props.vehicleType?.name) && props.vehicleType) ? "initial" : "hidden"}} onClick={() => setDeleteAlert(props.vehicleType)}>Delete</Button>
                <Button disabled={!props.vehicleType} style={{margin: "3px"}} onClick={props.onSaveType}>Save</Button>   
                <Button style={{margin: "3px"}} variant="secondary" onClick={onHide}>Close</Button>
            </div>
            <Alert className="d-flex justify-content-around mb-3" show={deleteAlert === props.vehicleType}>
                <Button onClick={() => props.onDeleteType(props.vehicleType)} variant="danger">
                    Delete {props.vehicleType?.name}
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