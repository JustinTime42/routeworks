
    import React, {  useState } from "react"
    import { useDispatch, useSelector } from "react-redux";
    import {Button, Alert, Modal, Form, Row, Col } from "react-bootstrap"
    import { createItem, deleteItem, editItem, setWhichModal, setTempItem } from "../actions"
    import {REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE} from '../constants.js'
    
    const RouteEditor = (props) => {
        const [deleteAlert, setDeleteAlert] = useState('')
        const routes = useSelector(state => state.requestRoutes.routes)
        const whichModal = useSelector(state => state.setWhichModal.whichModal)
        const tempItem = useSelector(state => state.setTempItem.item)
        const dispatch = useDispatch()

        const onChange = (event) => {
            dispatch(setTempItem({...tempItem, name: value}))
        }

        const onSave = () => {
            if (tempItem.key === 0) {            
                const {key, ...item} = tempItem 
                dispatch(createItem(item, routes, 'addroute', REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE))
            }
            else {
                dispatch(editItem(tempItem, routes, 'editroutes', REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE))
            } 
            dispatch(setWhichModal(null))    
       }

       const onDelete = (item) => {
        dispatch(deleteItem(tempItem, routes, "delroute", REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE))
        dispatch(setWhichModal(null))                 
    }

    return (
        <Modal show={whichModal === 'Driver'} onHide={() => dispatch(setWhichModal(null))}>
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
                                <Form.Control name="percentage" type="numeric" onChange={onChange} placeholder="Percentage" value={tempItem?.percentage} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column sm={2}>Hourly</Form.Label>
                            <Col sm={8}>
                                <Form.Control name="hourly" type="numeric" onChange={onChange} placeholder="Hourly" value={tempItem?.hourly} />
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

export default RouteEditor