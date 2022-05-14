import React, { useEffect, useState } from "react"
import {useSelector} from "react-redux"
import axios from "axios"
import { Dropdown, DropdownButton, Button, FormControl, Alert, Modal } from "react-bootstrap"
import Can from "../auth/Can"
import { AuthConsumer } from "../authContext"
// import { setActiveItem, createItem, deleteItem, setWhichModal, setTempItem } from "../actions"
import DropdownItem from "react-bootstrap/esm/DropdownItem";

const SimpleSelector = (props) => {    
    const [showEdit, setShowEdit] = useState(false)
    const isEditor = useSelector(state => state.showRouteEditor.showEditor)

    const toggleEdit = () => {
        setShowEdit(!showEdit)
    }  

    return (   
        <div style={props.style}>        
        <DropdownButton size="sm" title={props.selectedItem?.name || `Select ${props.title}`} onSelect={(event) => props.onSelect(event, props.itemArray, props.setActiveAction)} > 
        <AuthConsumer>
        {({ user }) => (
            <Can
                role={user.role}
                perform="admin:visit"
                yes={() => (
                    <div><Button style={{float: 'left', marginLeft:"1em"}} variant="primary" size="sm" onClick={toggleEdit}>{showEdit ? "Close" : "Edit"}</Button></div>                    
                )}
                no={() => null}               
            />                            
        )}
        </AuthConsumer>  
        <Button style={{marginLeft:"1em"}} variant="primary" size="sm" onClick={(event) => props.onSelect(null, props.itemArray, props.setActiveAction)}>Clear</Button> 
        {
            props.itemArray.filter(item => item.active === true).sort((a,b) => (b.name < a.name) ? 1 : -1).map((item, i) => {
                if (item.active || isEditor) {
                    return (
                        <div key={i} style={{display: "flex"}}>                        
                            <Dropdown.Item eventKey={`${item.key}`}>{item.name}
                                <Button style={{visibility: (showEdit) ? "initial" : "hidden"}} onClick={() => props.onEdit(item, props.whichModal)}>Edit</Button>
                            </Dropdown.Item>
                        </div>
                    )
                }                
            })
        }
        {
            isEditor ? 
            <>
            <Dropdown.Divider />
                {
                    props.itemArray.filter(item => item.active === false).sort((a,b) => (b.name < a.name) ? 1 : -1).map((item, i) => {
                        return (
                            <div key={i} style={{display: "flex", backgroundColor: "rgba(231,76,60,.2)"}}>                        
                                <Dropdown.Item eventKey={`${item.key}`}>{item.name}
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
    </DropdownButton>
    </div>
    )
}

export default SimpleSelector