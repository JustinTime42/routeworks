
import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { Button, Alert, Modal, Form, Row, Col, Dropdown } from "react-bootstrap"
import { createItem, deleteItem, editItem, hideModal, setTempItem } from "../../actions"
import { REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE, UPDATE_ADDRESSES_SUCCESS, UPDATE_FAILED, UPDATE_PENDING } from '../../constants.js'
import DropdownToggle from "react-bootstrap/esm/DropdownToggle";
import { useNavigate } from "react-router-dom";
    
const RouteEditor = (props) => {
    const [deleteAlert, setDeleteAlert] = useState('')
    const routes = useSelector(state => state.requestRoutes.routes)
    const customers = useSelector(state => state.requestAllAddresses.addresses)
    const modals = useSelector(state => state.whichModals.modals)
    const tempItem = useSelector(state => state.setTempItem.item)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const isEditable = (item) => {
        if (item?.editableBy?.includes(currentUser.claims.role)) return true
        else return false
    }

    const onClose = () => {
        dispatch(hideModal('Route'))
        setDeleteAlert(false)
        dispatch(setTempItem(null))
    }

    const onChange = (event) => {
        if (event.target.value === "on") {
            dispatch(setTempItem({...tempItem, [event.target.name]: !tempItem[event.target.name]}))
        } else {
            dispatch(setTempItem({...tempItem, name: event.target.value}))
        }
    }

    const onSelect = (event) => {
        console.log(event)
        dispatch(setTempItem({...tempItem, editableBy: event.split(',')}))
    }

    const onSave = () => {
        if (tempItem.id) {
            Object.keys(tempItem.customers).forEach(customerId => {
                let newCustomer = customers.find(item => item.id === customerId)
                newCustomer.routesAssigned[tempItem.id] = tempItem.name
                dispatch(editItem(newCustomer, customers, `organizations/${organization}/service_locations`, null, UPDATE_ADDRESSES_SUCCESS))
            })
            dispatch(editItem(tempItem, routes, `organizations/${organization}/route`, SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
        } else {
            dispatch(createItem(tempItem, `organizations/${organization}/route`, UPDATE_PENDING, SET_ACTIVE_ROUTE, UPDATE_FAILED))
        }
        dispatch(hideModal('Route'))
    }

    const onDelete = () => {
        // go through route customers and delete the routesAssigned on that customer document
        Object.keys(tempItem?.customers).forEach(customerId => {
            let newCustomer = customers.find(item => item.id === customerId)
            if(!newCustomer) {alert('customer not found: ' +  customerId)}
            delete newCustomer.routesAssigned[tempItem.id]
            dispatch(editItem(newCustomer, customers, `organizations/${organization}/service_locations`, null, UPDATE_ADDRESSES_SUCCESS, false))
        })
        dispatch(deleteItem(tempItem, routes, `organizations/${organization}/route`, SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
        dispatch(hideModal('Route'))
        navigate('/routebuilder')
                
    }

    if (modals.includes('Route')) {
        return (
            <Modal show={modals.includes('Route')&& isEditable(tempItem) } onHide={onClose}>
            <Modal.Body style={{display: "flex", flexFlow: "column nowrap", justifyContent: "center", alignItems: "space-between"}}>
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>Name</Form.Label>
                        <Col sm={8}>
                            <Form.Control name="name" type="text" onChange={onChange} placeholder="Name" value={tempItem?.name || ''}/>
                        </Col>
                </Form.Group>   
                <Form.Group as={Row} style={{alignItems:'center'}}>
                    <Form.Label column sm={2}>Active</Form.Label>
                    <Col sm={4}>
                        <Form.Check
                            name="active"
                            type="checkbox"
                            label="Active?"
                            checked = {!!tempItem?.active}
                            onChange={onChange}
                        /> 
                    </Col>
                    <Form.Label column sm={2}>Editable by:</Form.Label>
                    <Col sm={4}>
                    <Dropdown column sm={2} size="sm" onSelect={event => onSelect(event)}>
                        <DropdownToggle size="sm">{tempItem?.editableBy[0] || "Select"} </DropdownToggle>
                        <Dropdown.Menu>
                            <Dropdown.Item eventKey="Supervisor,Admin">Supervisor</Dropdown.Item>
                            <Dropdown.Item eventKey="Admin">Admin</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    </Col> 
                </Form.Group> 
                <div className="flex justify-content-around">
                    <Button variant="danger" style={{visibility: ((deleteAlert !== tempItem?.name) && tempItem && isEditable(tempItem)) ? "initial" : "hidden"}} onClick={() => setDeleteAlert(tempItem)}>Delete</Button>
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
    } else return null
}

export default RouteEditor