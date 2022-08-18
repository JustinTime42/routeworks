import React, {  useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import {Button, Alert, Modal, Form, Row, Col } from "react-bootstrap"
import { createItem, deleteItem, editItem, showModal, hideModal, setTempItem } from "../../actions"
import {GET_DRIVERS_SUCCESS, SET_ACTIVE_DRIVER, TEMP_ITEM} from '../../constants.js'

const DriverEditor = (props) => {
    const [deleteAlert, setDeleteAlert] = useState('')
    const drivers = useSelector(state => state.getDrivers.drivers)
    const modals = useSelector(state => state.whichModals.modals)
    const tempItem = useSelector(state => state.setTempItem.item)
    const dispatch = useDispatch()

    useEffect(() => {
        if (!tempItem && modals.includes('Driver')) {
            console.log("updating driver editor")
            dispatch(setTempItem({name: '', active: true, hourly: 0, percentage: 0}))
        }
    }, [tempItem])

    const onChange = (event) => {     
        console.log(event.target.value)       
        let {target: {name, value} } = event
        if (name === "percentage" || name === "hourly") {
            value = Number(value)
            if (isNaN(value)) {
                value = tempItem[name]
            }
            dispatch(setTempItem({...tempItem, [name]: value}))
        } else if (event.target.value === "on") {
            console.log("toggling active")
            dispatch(setTempItem({...tempItem, active: !tempItem.active}))
        } else {
            dispatch(setTempItem({...tempItem, [name]: value}))
        }
    }

    const onSave = () => {
        if (tempItem.id) { 
            dispatch(editItem(tempItem, drivers, 'driver/driver_lists/driver', SET_ACTIVE_DRIVER, GET_DRIVERS_SUCCESS)) 
        }
        else {
            dispatch(createItem(tempItem, drivers, 'driver/driver_lists/driver', SET_ACTIVE_DRIVER, GET_DRIVERS_SUCCESS))
        } 
        dispatch(hideModal('Driver'))    
    }

    const onDelete = (item) => {
    dispatch(deleteItem(item, drivers, 'driver/driver_lists/driver', SET_ACTIVE_DRIVER, GET_DRIVERS_SUCCESS))
    dispatch(hideModal('Driver'))                 
    }

    const onClose = () => {
        dispatch(hideModal('Driver'))
        setDeleteAlert(false)
    }

    return (
        <Modal show={modals.includes('Driver')} onHide={onClose}>
            <Modal.Body style={{display: "flex", flexFlow: "column nowrap", justifyContent: "center", alignItems: "space-between"}}>
                <Form.Group as={Row}>
                            <Form.Label column sm={2}>Name</Form.Label>
                            <Col sm={8}>
                                <Form.Control name="name" type="text" onChange={onChange} placeholder="Name" value={tempItem?.name || ''}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column sm={2}>Percentage</Form.Label>
                            <Col sm={8}>
                                <Form.Control name="percentage" type="numeric" onChange={onChange} placeholder="Percentage" value={tempItem?.percentage || 0} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column sm={2}>Hourly</Form.Label>
                            <Col sm={8}>
                                <Form.Control name="hourly" type="numeric" onChange={onChange} placeholder="Hourly" value={tempItem?.hourly || 0} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                    <Form.Label column sm={2}>Active</Form.Label>
                    <Col sm={8}>
                        <Form.Check
                            name="active"
                            type="checkbox"
                            label="Active?"
                            checked = {!!tempItem?.active}
                            onChange={onChange}
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
    )
}

export default DriverEditor