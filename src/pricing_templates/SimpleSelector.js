import React, { useEffect, useState } from "react"
import { useLocation } from 'react-router-dom'
import { Dropdown, Button, } from "react-bootstrap"

const SimpleSelector = (props) => {    
    const [showEdit, setShowEdit] = useState(false)
  
    useEffect(() => { 
        const unsub = props.dbQuery()
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
        <Dropdown size="sm" onSelect={props.onSelect} > 
            <Dropdown.Toggle size='sm'>
                {props.selectedItem?.name || `${props.title}`}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{maxHeight: '80vh', overflow:'scroll'}} >
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
            <Button style={{marginLeft:"1em"}} variant="primary" size="sm" onClick={() => props.onSelect(null)}>Clear</Button>
            {
                props.itemArray ?                   
                    props.itemArray.sort((a,b) => (b.name < a.name) ? 1 : -1).map((item, i) => {   
                        return (
                            <div key={i}>                        
                                <Dropdown.Item eventKey={item.name} style={{marginBottom:'1em'}}>
                                    {item.name}                                    
                                    <Button size='sm' disabled={!item.id} style={{visibility: (showEdit) ? "initial" : "hidden", marginBottom:'3px', marginLeft: '3px'}} onClick={() => props.onEdit(item, props.whichModal, props.collection)}>Edit</Button>
                                    {props.renderItem ? props.renderItem(item) : null}
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