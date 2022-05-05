    import React, {  useState } from "react"
    import { useDispatch, useSelector } from "react-redux";
    import {Button, Alert, Modal, Form, Row, Col } from "react-bootstrap"
    import { createItem, deleteItem, editItem, showModal, hideModal, setTempItem } from "../../actions"
    import {SET_WORK_TYPE, GET_WORK_TYPES_SUCCESS} from '../../constants.js'
    
    const WorkTypeEditor = (props) => {
        const [deleteAlert, setDeleteAlert] = useState('')
        const workTypes = useSelector(state => state.getWorkTypes.allWorkTypes)
        const modals = useSelector(state => state.whichModals.modals)
        const tempItem = useSelector(state => state.setTempItem.item)
        const dispatch = useDispatch()

        const onChange = (event) => {
            dispatch(setTempItem({...tempItem, name: event.target.value}))
        }

        const onSave = () => {
            if (tempItem.key === 0) {            
                const {key, ...item} = tempItem 
                dispatch(createItem(item, workTypes, 'newworktype', GET_WORK_TYPES_SUCCESS, SET_WORK_TYPE))
            }
            else {
                dispatch(editItem(tempItem, workTypes, 'editworktype', GET_WORK_TYPES_SUCCESS, SET_WORK_TYPE))
            } 
            dispatch(hideModal('WorkType'))    
        }

        const onDelete = () => {
            dispatch(deleteItem(tempItem, workTypes, 'deleteworktype', GET_WORK_TYPES_SUCCESS, SET_WORK_TYPE))
            dispatch(hideModal('WorkType'))                 
        }

    return (
        <Modal show={modals.includes('WorkType')} onHide={() => dispatch(hideModal('WorkType'))}>
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
                    <Button style={{margin: "3px"}} variant="secondary" onClick={() => dispatch(hideModal('WorkType'))}>Close</Button>
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