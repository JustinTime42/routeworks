
    import React, {  useEffect, useState } from "react"
    import { useDispatch, useSelector } from "react-redux";
    import { Button, Alert, Modal, Form, Row, Col } from "react-bootstrap"
    import { createItem, deleteItem, editItem, showModal, hideModal, setTempItem } from "../../actions"
    import { REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE, UPDATE_ADDRESSES_SUCCESS } from '../../constants.js'
    
    const RouteEditor = (props) => {
        const [deleteAlert, setDeleteAlert] = useState('')
        const routes = useSelector(state => state.requestRoutes.routes)
        const customers = useSelector(state => state.requestAllAddresses.addresses)
        const modals = useSelector(state => state.whichModals.modals)
        const tempItem = useSelector(state => state.setTempItem.item)
        const dispatch = useDispatch()

        useEffect(() => {
            if(!('name' in tempItem) && modals.includes('Route')) {
                dispatch(setTempItem({name: '', active: true, customers: []}))
            }
        },[tempItem])

        const onClose = () => {
            dispatch(hideModal('Route'))
            setDeleteAlert(false)
        }

        const onChange = (event) => {
            if (event.target.value === "on") {
                dispatch(setTempItem({...tempItem, [event.target.name]: !tempItem[event.target.name]}))
            } else {
                dispatch(setTempItem({...tempItem, name: event.target.value}))
            }
        }

        const onSave = () => {
            if (tempItem.id) {
                dispatch(editItem(tempItem, routes, 'driver/driver_lists/route', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
            } else {
                dispatch(createItem(tempItem, routes, 'driver/driver_lists/route', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
            }
            dispatch(hideModal('Route'))
        }

        const onDelete = () => {
            // go through route customers and delete the routesAssigned on that customer document
            tempItem.customers.map(customer => {
                let newCustomer = customers.find(item => item.id === customer.id)
                let newRoutesAssigned = newCustomer.routesAssigned.filter(item => item !== tempItem.name)
                newCustomer.routesAssigned = newRoutesAssigned
                dispatch(editItem(newCustomer, customers, 'driver/driver_lists/customer', null, UPDATE_ADDRESSES_SUCCESS))
            })
            dispatch(deleteItem(tempItem, routes, 'driver/driver_lists/route', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
            dispatch(hideModal('Route'))                 
        }

    return (
        <Modal show={modals.includes('Route')} onHide={onClose}>
            <Modal.Body style={{display: "flex", flexFlow: "column nowrap", justifyContent: "center", alignItems: "space-between"}}>
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>Name</Form.Label>
                        <Col sm={8}>
                            <Form.Control name="name" type="text" onChange={onChange} placeholder="Name" value={tempItem?.name || ''}/>
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

export default RouteEditor