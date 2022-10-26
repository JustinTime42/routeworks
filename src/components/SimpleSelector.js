import React, { useEffect, useState } from "react"
import { useLocation } from 'react-router-dom'
import {useSelector, useDispatch} from "react-redux"
import { collection, onSnapshot } from "firebase/firestore";
import { db } from '../firebase' 
import { Dropdown, Button, } from "react-bootstrap"

const SimpleSelector = (props) => {    
    const [showEdit, setShowEdit] = useState(false)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const dispatch = useDispatch()
    let location = useLocation()
  
    useEffect(() => { 
        const unsub = onSnapshot(collection(db, `${props.collectionPath}${props.collection}`), (querySnapshot) => {
            dispatch({type:props.reduxListAction, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
        })
        return () => {
            unsub()
        }
    },[])

    useEffect(() => {
        setShowEdit(false)
    },[props.selectedItem])

    const toggleEdit = () => {
        setShowEdit(!showEdit)
    }
   
    return (   
        <div style={props.style}>        
        <Dropdown size="sm" onSelect={(event) => props.onSelect(event, props.itemArray, props.setActiveAction)} > 
            <Dropdown.Toggle size='sm'>
                {props.selectedItem?.name || `Select ${props.title}`}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{maxHeight: '80vh', overflow:'scroll'}} >
            {
                currentUser.admin ? 
                <div style={{display: 'flex', float: "left"}}>
                    <Button style={{marginLeft:"1em"}} variant="primary" size="sm" onClick={toggleEdit}>{showEdit ? "Close" : "Edit"}</Button>
                    <Button 
                        style={{visibility: showEdit ? "initial" : "hidden", marginLeft:"1em"}} 
                        variant="primary" 
                        size="sm" 
                        onClick={() => props.onCreate(props.whichModal)}>
                        New
                    </Button>
                </div>   : null
            }        
            <Button style={{marginLeft:"1em"}} variant="primary" size="sm" onClick={(event) => props.onSelect(null, props.itemArray, props.setActiveAction)}>Clear</Button>
            {
                props.itemArray ?                   
                        props.itemArray.filter(item => item.active).sort((a,b) => (b.name < a.name) ? 1 : -1).map((item, i) => {    
                                                    
                                return (
                                    <div key={i} style={{display: "flex"}}>                        
                                        <Dropdown.Item eventKey={item.name}>{item.name}
                                            <Button disabled={!item.id} style={{visibility: (showEdit) ? "initial" : "hidden"}} onClick={() => props.onEdit(item, props.whichModal, props.collection)}>Edit</Button>
                                        </Dropdown.Item>
                                    </div>
                                )                                           
                        })
                        
                    : null
            }             
            {
                (location.pathname === '/routebuilder') && props.itemArray ? 
                    props.itemArray.filter(item => !item.active).sort((a,b) => (b.name < a.name) ? 1 : -1).map((item, i) => { 
                        return (
                            <div key={i} style={{display: "flex", backgroundColor:"rgba(231, 76, 60, 0.2)"}}>                        
                                <Dropdown.Item eventKey={item.name}>{item.name}
                                    <Button style={{visibility: (showEdit) ? "initial" : "hidden"}} onClick={() => props.onEdit(item, props.whichModal, props.collection)}>Edit</Button>
                                </Dropdown.Item>
                            </div>
                        )                                           
                })                
                : null
            }
            </Dropdown.Menu>
    </Dropdown>
    </div>
    )
}

export default SimpleSelector