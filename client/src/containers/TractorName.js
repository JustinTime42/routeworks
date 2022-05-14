import React, { useEffect, useState, useContext, useCallback } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { Dropdown, DropdownButton, Button, FormControl, Modal, Alert } from "react-bootstrap"
import { setActiveTractor, getTractors, deleteItem, createItem, getTractorTypes } from '../actions'
import Can from "../auth/Can"
import { AuthConsumer } from "../authContext"
//import {SocketContext, socket} from '../socket'
import {GET_TRACTORS_SUCCESS} from '../constants.js'

//Deprecated component
const TractorName = () => {
    const [showEdit, setShowEdit] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showDelete, setShowDelete] = useState('')
    const [newTractorName, editNewTractorName] = useState("")
    const [newTractorType, editNewTractorType] = useState("")
    const tractor = useSelector(state => state.setActiveTractor.activeTractor)
    const allTractors = useSelector(state => state.getTractors.allTractors)
    const tractorTypes = useSelector(state => state.getTractorTypes.tractorTypes)
    const dispatch = useDispatch()
    //const socket = useContext(SocketContext);

    useEffect(() => {
        dispatch(getTractors())
        dispatch(getTractorTypes())
    }, [])

    const toggleEdit = () => {
        setShowEdit(!showEdit)
        setShowDelete('')
    } 

    const onSaveNew = () => {
        dispatch(createItem({name: newTractorName, type: newTractorType}, allTractors, "newTractor", GET_TRACTORS_SUCCESS))
        setShowModal(false)
        setShowEdit(false)
    } 

    const onDelete = (tractor) => {
        dispatch(deleteItem(tractor, allTractors, "deletetractor", GET_TRACTORS_SUCCESS))
        setShowDelete('') 
    }

    return (
        <>
        <DropdownButton size="sm" title={tractor.name || "Select Tractor"} onSelect={(event) => dispatch(setActiveTractor(event, allTractors))} > 
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
                allTractors.map((tractor, i) => {
                    return (
                        <div key={i} style={{display: "flex"}}>
                            <Dropdown.Item eventKey={tractor.name}>{tractor.name} | {tractor.type}</Dropdown.Item>  
                            <Button style={{visibility: (showEdit && (showDelete !== tractor.name)) ? "initial" : "hidden"}} onClick={() => setShowDelete(tractor.name)}>Delete</Button>
                            <Alert show={showDelete === tractor.name} variant="danger">
                                <div className="d-flex justify-content-end">
                                <Button onClick={() => onDelete(tractor, allTractors)} variant="outline-success">
                                    Delete {tractor.name}
                                </Button>
                                <Button onClick={() => setShowDelete('')} variant="outline-success">
                                    Cancel
                                </Button>
                                </div>
                        </Alert>
                        </div>
                    )
                })
            }   
            <Button style={{visibility: showEdit ? "initial" : "hidden", marginLeft:"1em"}} variant="primary" size="sm" onClick={() => setShowModal(true)}>New Tractor</Button>
        </DropdownButton>
        <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Body style={{display: "flex", justifyContent: "space-between"}}>
            <FormControl style={{width: '50%'}} size="sm" name="name" type="text" onChange={(event) => editNewTractorName(event.target.value)} placeholder="Name" value={newTractorName} />
            <DropdownButton onClick={e => e.stopPropagation()} size="sm" title={newTractorType || "Type"} onSelect={event => editNewTractorType(event)}>
                {
                    tractorTypes.map(item => <Dropdown.Item key={item.type} eventKey={item.type}>{item.type}</Dropdown.Item>)
                }                            
            </DropdownButton>
            <Button size="sm" onClick={onSaveNew}>Save</Button>   
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>  
            </Modal.Body> 
        </Modal>   
        </>
    )    
}
// deprecated component in favor of TractorEditor
// export default TractorName