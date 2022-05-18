import React, { useEffect, useState } from "react"
import {useSelector, useDispatch} from "react-redux"
import {  useParseQuery, initializeParse } from  '@parse/react';
import { Dropdown, Button, } from "react-bootstrap"
import Can from "../auth/Can"
import { AuthConsumer } from "../authContext"
import Parse from 'parse/dist/parse.min.js';

const SimpleSelector = (props) => {    
    const [showEdit, setShowEdit] = useState(false)
    const isEditor = useSelector(state => state.showRouteEditor.showEditor)
    const userRole = useSelector(state => state.setCurrentUser.currentUser.get('appRole'))
    const dispatch = useDispatch()
    const parseQuery = new Parse.Query(props.className);
    const {
       isLive,
       isLoading,
       isSyncing,
       results,
       count,
       error,
       reload
     } = useParseQuery(parseQuery, {
        enableLocalDatastore: true, 
        enableLiveQuery: true, 
      });

    const toggleEdit = () => {
        setShowEdit(!showEdit)
    }

    // useEffect(() => {
    //     console.log(results)
    //     if (results) {
    //         console.log(results.filter(item => (!item.get('active'))))
    //         dispatch(props.reduxListAction(results))
    //     }
    // },[])

    return (   
        <div style={props.style}>   
            {isLoading && (
                <p>Loading...</p>
            )}
            {isLive && (
                <p>Live!</p>
            )}
            {isSyncing && (
                <p>Syncing...</p>
            )}  
            {results && (
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
                        results.filter(item => item.get('active')).sort((a,b) => (b.get('name') < a.get('name')) ? 1 : -1).map((item, i) => {    
                            console.log(item)                        
                                return (
                                    <div key={i} style={{display: "flex"}}>                        
                                        <Dropdown.Item eventKey={`${item.get('objectID')}`}>{item.get('name')}
                                            <Button style={{visibility: (showEdit) ? "initial" : "hidden"}} onClick={() => props.onEdit(item, props.whichModal)}>Edit</Button>
                                        </Dropdown.Item>
                                    </div>
                                )                                           
                        })
                    }
                    {
                        userRole === 'Admin' ? 
                        <>
                        <Dropdown.Divider />
                            {
                                results.filter(item => (!item.get('active'))).sort((a,b) => (b.get('name') < a.get('name')) ? 1 : -1).map((item, i) => {
                                    return (
                                        <div key={i} style={{display: "flex", backgroundColor: "rgba(231,76,60,.2)"}}>                        
                                            <Dropdown.Item eventKey={`${item.id}`}>{item.get('name')}
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
    </div>
    )
}

export default SimpleSelector