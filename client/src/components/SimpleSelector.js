import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import axios from "axios"
import { Dropdown, DropdownButton, Button, FormControl, Alert, Modal } from "react-bootstrap"
import Can from "../auth/Can"
import { AuthConsumer } from "../authContext"
import { setActiveItem, createItem, deleteItem } from "../actions"

const editStyle = {
    float: "right"
} // future feature

const SimpleSelector = (props) => {    
    const [showEdit, setShowEdit] = useState(false)
    const [deleteAlert, setDeleteAlert] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [newItem, setNewItem] = useState({})

    const dispatch = useDispatch()

    const onCreate = () => {
        console.log({newItem, ...props.additionalFields})
        dispatch(createItem({...newItem, ...props.additionalFields}, props.itemArray, props.createEndpoint, props.updateListAction))
        setShowModal(false)
        setShowEdit(false)
        setNewItem({})
    } 

    const onDelete = (item) => {
        console.log("selected item", item)
        dispatch(deleteItem(item, props.itemArray, props.deleteEndpoint, props.updateListAction))
        setDeleteAlert('') 
        setShowEdit(false)        
    }

    const toggleEdit = () => {
        setShowEdit(!showEdit)
        setDeleteAlert('')
    }

    const closeModal = () => {
        setShowModal(false)
        setNewItem({})
        setShowEdit(false)
    }

    const onSelect = (event) => {
        dispatch(setActiveItem(event, props.itemArray, props.setActiveAction))
        props.selectActions?.forEach(item => dispatch(item()))
    }

    return (   
        <>        
        <DropdownButton size="sm" title={props.selectedItem.name || `Select ${props.title}`} onSelect={(event) => onSelect(event)} > 
        <AuthConsumer>
        {({ user }) => (
            <Can
                role={user.role}
                perform="admin:visit"
                yes={() => (
                    <div><Button style={{marginLeft:"1em"}} variant="primary" size="sm" onClick={toggleEdit}>{showEdit ? "Close" : "Edit"}</Button></div>                    
                )}
                no={() => null}               
            />                            
        )}
        </AuthConsumer> 
        {
            props.itemArray.sort((a,b) => (b.name < a.name) ? 1 : -1).map((item, i) => {
                return (
                    <div key={i} style={{display: "flex"}}>
                        <Dropdown.Item eventKey={item.name}>{item.name} {item.type ? ` | ${item.type}` : null}</Dropdown.Item>  
                        <Button style={{visibility: (showEdit && (deleteAlert !== item.name)) ? "initial" : "hidden"}} onClick={() => setDeleteAlert(item.name)}>Delete</Button>
                        <Alert show={deleteAlert === item.name} variant="danger">
                            <div className="d-flex justify-content-end">
                            <Button onClick={() => onDelete(item)} variant="outline-success">
                                Delete {item.name}
                            </Button>
                            <Button onClick={() => setDeleteAlert('')} variant="outline-success">
                                Cancel
                            </Button>
                            </div>
                    </Alert>
                    </div>
                )
            })
        }   
        <Button style={{visibility: showEdit ? "initial" : "hidden", marginLeft:"1em"}} variant="primary" size="sm" onClick={() => setShowModal(true)}>New {props.title}</Button>
    </DropdownButton>
    <Modal show={showModal} onHide={closeModal}>
        <Modal.Body style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <FormControl style={{width: '50%', margin: "3px"}} size="sm" name="name" type="text" onChange={(event) => setNewItem({name:event.target.value})} placeholder="Name" value={newItem.name || ''} />
            {props.children}
            <Button disabled={!newItem.name} style={{margin: "3px"}} size="sm" onClick={onCreate}>Save</Button>   
            <Button style={{margin: "3px"}} variant="secondary" onClick={closeModal}>Close</Button>  
        </Modal.Body> 
    </Modal>   
    </>
    )
}

export default SimpleSelector