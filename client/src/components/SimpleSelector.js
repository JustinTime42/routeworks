import React, { useEffect, useState } from "react"
import {useSelector, useDispatch} from "react-redux"
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {REQUEST_ROUTES_SUCCESS} from '../constants'
import { firebase, db } from '../firebase' 
import { Dropdown, Button, } from "react-bootstrap"
import { user } from "pg/lib/defaults";
import { requestRoutes } from "../actions";

const SimpleSelector = (props) => {    
    const [showEdit, setShowEdit] = useState(false)
    const isEditor = useSelector(state => state.showRouteEditor.showEditor)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)

    const dispatch = useDispatch()
  
    useEffect(() => {
        const q = query(collection(db, props.collection))
        const unsub = onSnapshot(q, (querySnapshot) => {
            const results = [];
            querySnapshot.forEach((doc) => {
                const id = doc.id
                results.push({...doc.data(), id});
            })
            dispatch({type:props.reduxListAction, payload: results})
        })
        return () => {
            unsub()
        }        
    },[])

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
                        onClick={() => props.onCreate(props.whichModal, {active:true})}>
                        New
                    </Button>
                </div>   : null
            }
                                             
                        
            <Button style={{marginLeft:"1em"}} variant="primary" size="sm" onClick={(event) => props.onSelect(null, props.itemArray, props.setActiveAction)}>Clear</Button>
            {
                props.itemArray ? 
                    // <Dropdown size="sm" onSelect={(event) => props.onSelect(event, props.itemArray, props.setActiveAction)} > 
                    // <Dropdown.Toggle size='sm'>
                    //     {props.selectedItem?.name || `Select ${props.title}`}
                    // </Dropdown.Toggle>
                    // <Dropdown.Menu style={{maxHeight: '80vh', overflow:'scroll'}} >
                    //     {
                    //         userRole === 'Admin' ?
                    //         <div><Button style={{float: 'left', marginLeft:"1em"}} variant="primary" size="sm" onClick={toggleEdit}>{showEdit ? "Close" : "Edit"}</Button></div>                    
                    //         : null
                    //     }
                    // <Button style={{marginLeft:"1em"}} variant="primary" size="sm" onClick={(event) => props.onSelect(null, props.itemArray, props.setActiveAction)}>Clear</Button> 
                  
                        props.itemArray.filter(item => item.active).sort((a,b) => (b.name < a.name) ? 1 : -1).map((item, i) => {    
                                                    
                                return (
                                    <div key={i} style={{display: "flex"}}>                        
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