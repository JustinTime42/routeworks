
    import React, {  useState } from "react"
    import { useDispatch, useSelector } from "react-redux";
    import {Button, Alert, Modal, Form, Row, Col } from "react-bootstrap"
    import { createItem, deleteItem, editItem, showModal, hideModal, setTempItem } from "../../actions"
    import {REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE} from '../../constants.js'
    
    const RouteEditor = (props) => {
        const [deleteAlert, setDeleteAlert] = useState('')
        const routes = useSelector(state => state.requestRoutes.routes)
        const modals = useSelector(state => state.whichModals.modals)
        const tempItem = useSelector(state => state.setTempItem.item)
        const dispatch = useDispatch()

        const onChange = (event) => {
            if (event.target.value === "on") {
                dispatch(setTempItem({...tempItem, [event.target.name]: !tempItem[event.target.name]}))
            } else {
                dispatch(setTempItem({...tempItem, name: event.target.value}))
            }  
        }   

        const onSave = () => {
            dispatch(createItem(tempItem, routes, 'route', REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE))

            // if (tempItem.key === 0) {            
            //     const {key, ...item} = tempItem 
            //     dispatch(createItem(item, routes, 'route', REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE))
            // }
            // else {
            //     dispatch(editItem(tempItem, routes, 'editroute', REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE))
            // } 
            dispatch(hideModal('Route'))    
        }

        const onDelete = () => {
            dispatch(deleteItem(tempItem, routes, "delroute", REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE))
            dispatch(hideModal('Route'))                 
        }

    return (
        <Modal show={modals.includes('Route')} onHide={() => dispatch(hideModal('Route'))}>
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
                    <Button style={{margin: "3px"}} variant="secondary" onClick={() => dispatch(hideModal('Route'))}>Close</Button>
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