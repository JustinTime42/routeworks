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

    //TODO get RBAC working
    const userRole = 'Admin' // useSelector(state => state.setCurrentUser.currentUser.get('appRole'))
    const dispatch = useDispatch()
  
    useEffect(() => {
        const q = query(collection(db, "route"))
        const unsub = onSnapshot(q, (querySnapshot) => {
            const results = [];
            querySnapshot.forEach((doc) => {
                results.push(doc.data());
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
        <AuthConsumer>
        {({ user }) => (
            <Can
                role={user.role}
                perform="admin:visit"
                yes={() => (
                    <div style={{display: 'flex', float: "left"}}>
                        <Button style={{marginLeft:"1em"}} variant="primary" size="sm" onClick={toggleEdit}>{showEdit ? "Close" : "Edit"}</Button>
                        <Button 
                            style={{visibility: showEdit ? "initial" : "hidden", marginLeft:"1em"}} 
                            variant="primary" 
                            size="sm" 
                            onClick={() => props.onCreate(props.whichModal)}>
                            New
                        </Button>
                    </div>                    
                )}
                no={() => null}               
            />                            
        )}
        </AuthConsumer>  
        <Button style={{marginLeft:"1em"}} variant="primary" size="sm" onClick={(event) => props.onSelect(null, props.itemArray, props.setActiveAction)}>Clear</Button> 
        {
            props.itemArray && (
                <Dropdown size="sm" onSelect={(event) => props.onSelect(event, props.itemArray, props.setActiveAction)} > 
                <Dropdown.Toggle size='sm'>
                    {props.selectedItem?.name || `Select ${props.title}`}
                </Dropdown.Toggle>
                <Dropdown.Menu style={{maxHeight: '80vh', overflow:'scroll'}} >
                    {
                        userRole === 'Admin' ?
                        <div><Button style={{float: 'left', marginLeft:"1em"}} variant="primary" size="sm" onClick={toggleEdit}>{showEdit ? "Close" : "Edit"}</Button></div>                    
                        : null
                    }
                <Button style={{marginLeft:"1em"}} variant="primary" size="sm" onClick={(event) => props.onSelect(null, props.itemArray, props.setActiveAction)}>Clear</Button> 
                {
                    props.itemArray.filter(item => item.active).sort((a,b) => (b.name < a.name) ? 1 : -1).map((item, i) => {    
                                                
                            return (
                                <div key={i} style={{display: "flex"}}>                        
                                    <Dropdown.Item eventKey={item.name}>{item.name}
                                        <Button style={{visibility: (showEdit) ? "initial" : "hidden"}} onClick={() => props.onEdit(item, props.whichModal)}>Edit</Button>
                                    </Dropdown.Item>
                                </div>
                            )                                           
                    })
                }
<<<<<<< HEAD
                {
                    userRole === 'Admin' ? 
                    <>
                    <Dropdown.Divider />
                        {
                            props.itemArray.filter(item => (!item.active)).sort((a,b) => (b.name < a.name) ? 1 : -1).map((item, i) => {
                                return (
                                    <div key={i} style={{display: "flex", backgroundColor: "rgba(231,76,60,.2)"}}>                        
                                        <Dropdown.Item eventKey={`${item.name}`}>{item.name}
                                            <Button style={{visibility: (showEdit) ? "initial" : "hidden"}} onClick={() => props.onEdit(item, props.whichModal)}>Edit</Button>
                                        </Dropdown.Item>
                                    </div>
                                )                              
                            })
                        }
                    </>                
                    : null
                } 
                <Button 
                    style={{visibility: showEdit ? "initial" : "hidden", marginLeft:"1em"}} 
                    variant="primary" 
                    size="sm" 
                    onClick={() => props.onCreate(props.whichModal)}>
                    New {props.title}
                </Button>
                </Dropdown.Menu>
            </Dropdown>  
            )}                             
=======
            </>                
            : null
        } 
        </Dropdown.Menu>
    </Dropdown>
>>>>>>> 0f8a2bea29fe6639d2e763702eb9f9d200bceca0
    </div>
    )
}

export default SimpleSelector