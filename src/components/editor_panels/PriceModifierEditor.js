    import React, {  useEffect, useState } from "react"
    import { useDispatch, useSelector } from "react-redux";
    import {Button, Alert, Modal, Form, Row, Col, DropdownButton, Dropdown } from "react-bootstrap"
    import { createItem, deleteItem, editItem, showModal, hideModal, setTempItem, setActiveItem } from "../../actions"
    import {SET_WORK_TYPE, GET_WORK_TYPES_SUCCESS} from '../../constants.js'
    
    const PriceModifierEditor = (props) => {
        const [deleteAlert, setDeleteAlert] = useState('')        
        const modals = useSelector(state => state.whichModals.modals)
        const tempItem = useSelector(state => state.setTempItem.item)
        const workTypes = useSelector(state => state.getWorkTypes.allWorkTypes)
        const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
        const [operators, setOperators] = useState(['+', '-', '*', '/'])
        const [operator, setOperator] = useState(null)

        const dispatch = useDispatch()

        const onChange = (event) => {
            const {target: {name, value}} = event
            dispatch(setTempItem({...tempItem, [name]: value}))
        }

        const onChangeOperator = (event) => {
            setOperator(event)
            dispatch(setTempItem({...tempItem, operator: event}))
        }

        const onClose = () => {
            dispatch(hideModal('Pricing Modifiers'))
            setDeleteAlert(false)
            dispatch(setTempItem(null))
        }

        const onSave = () => {
            const newTempItem = {...tempItem, value: Number(tempItem.value)}
            if (!tempItem.id) {
                dispatch(createItem(newTempItem, workTypes, `organizations/${organization}/price_modifiers`))                               
            }
            else {
                dispatch(editItem(newTempItem, workTypes, `organizations/${organization}/price_modifiers`))
            } 
            dispatch(hideModal('Pricing Modifiers'))    
        }

        const onDelete = () => {
            dispatch(deleteItem(tempItem, workTypes, `organizations/${organization}/price_modifiers`))
            dispatch(hideModal('Pricing Modifiers'))                 
        }

    return (
        <Modal show={modals.includes('Pricing Modifiers')} onHide={onClose}>
            <Modal.Body style={{display: "flex", flexFlow: "column nowrap", justifyContent: "center", alignItems: "space-between"}}>
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>Name</Form.Label>
                    <Col sm={8}>
                        <Form.Control name="name" type="text" onChange={onChange} placeholder="Name" value={tempItem?.name || ''}/>
                    </Col>
                </Form.Group>
                <DropdownButton name="operator" title={operator || "Select Operator"} onSelect={onChangeOperator}>
                    {operators.map(operator => <Dropdown.Item key={operator} eventKey={operator}>{operator}</Dropdown.Item>)}              
                </DropdownButton>         
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>Value</Form.Label>
                    <Col sm={8}>
                        <Form.Control name="value" type="text" onChange={onChange} placeholder="Value" value={tempItem?.value || ""}/>
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

export default PriceModifierEditor