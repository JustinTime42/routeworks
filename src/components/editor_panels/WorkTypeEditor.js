    import React, {  useEffect, useState } from "react"
    import { useDispatch, useSelector } from "react-redux";
    import {Button, Alert, Modal, Form, Row, Col } from "react-bootstrap"
    import { createItem, deleteItem, editItem, showModal, hideModal, setTempItem } from "../../actions"
    import {SET_WORK_TYPE, GET_WORK_TYPES_SUCCESS} from '../../constants.js'
    
    const WorkTypeEditor = (props) => {
        const [deleteAlert, setDeleteAlert] = useState('')
        
        const modals = useSelector(state => state.whichModals.modals)
        const tempItem = useSelector(state => state.setTempItem.item)
        const workTypes = useSelector(state => state.getWorkTypes.allWorkTypes)
        const dispatch = useDispatch()

        const onChange = (event) => {
            if (event.target.value === 'on') {
                dispatch(setTempItem({...tempItem, active: !tempItem.active}))
            } else {
                dispatch(setTempItem({...tempItem, name: event.target.value}))
            }            
        }

        useEffect(() => {
            if(!tempItem && modals.includes('WorkType')) {
                dispatch(setTempItem({name: '', active: true}))
            }
        },[tempItem])

        const onClose = () => {
            dispatch(hideModal('WorkType'))
            setDeleteAlert(false)
            dispatch(setTempItem(null))
        }

        const onSave = () => {
            if (!tempItem.id) {
                dispatch(createItem(tempItem, workTypes, 'driver/driver_lists/work_type', SET_WORK_TYPE, GET_WORK_TYPES_SUCCESS))                               
            }
            else {
                dispatch(editItem(tempItem, workTypes, 'driver/driver_lists/work_type', SET_WORK_TYPE, GET_WORK_TYPES_SUCCESS))
            } 
            dispatch(hideModal('WorkType'))    
        }

        const onDelete = () => {
            dispatch(deleteItem(tempItem, workTypes, 'driver/driver_lists/work_type', SET_WORK_TYPE, GET_WORK_TYPES_SUCCESS))
            dispatch(hideModal('WorkType'))                 
        }

    return (
        <Modal show={modals.includes('WorkType')} onHide={onClose}>
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

export default WorkTypeEditor