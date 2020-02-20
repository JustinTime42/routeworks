import React from 'react'
import { Button } from 'react-bootstrap'
//import { shallow, mount, render } from 'enzyme'

const PropertyCard = (props) => {

    const routePosition = props.i >= 0 ? `${props.i + 1}. ` : ''

    const cardStyle = {
        margin: '3px',
        padding: '3px',
        width: props.width,
        backgroundColor: props.activeProperty ? props.activeProperty.key === props.address.key ? '#4E8098' : '#303030   ' : null
    }
    const rightStyle = {
        float: "right", 
        textAlign: "center",
        width: "70px",               
    }

    const statusStyle = {
        padding: "10px",
        border: "2px, solid, black",
        borderRadius: "10px",
        backgroundColor: props.address ? props.address.status === "Waiting" ? `rgba(255,200,0,0.9)` : 
        props.address.status === "Skipped" ? `rgba(255,0,0,0.7)` :
        props.address.status === "Done" ? `rgba(0,255,0,0.7)` : null : null
    }

    const seasonalStyle = {
        display: "inline",
        float: "left",
        padding: "5px",
        border: "1px, solid, #CCE5FF",
        borderRadius: "5px",
        backgroundColor: props.address ? props.address.seasonal ? "#375A7F" : `rgba(0,0,0,0.0)` : `rgba(0,0,0,0.0)`
    }

    const editStyle = {
        verticalAlign: "bottom"
    }

    return(
        <div id={`card${props.i}`} style={cardStyle} onClick={() => props.handleClick(props.address)}>
            <div style={rightStyle}>
                <div style={seasonalStyle}></div>
                {props.address ? 
                    <p style={statusStyle}>{props.address.status}</p> : <p style={statusStyle}></p>             
                } 
                {props.admin === true ? 
                    <p style={editStyle}><Button variant="secondary" onClick={() => props.editClick(props.address)}>Edit </Button></p>  : <p></p>               
                }
            </div>

            <p style={{textAlign: "left", width: "100%"}}>  
            {routePosition}{props.address ? props.address.cust_name ? props.address.cust_name : "name" : "name"}{props.address ? props.address.is_new ? "*" : null : null}            
            </p>                             
            <p>{props.address ? props.address.address ? props.address.address : "address" : "address"} </p>            
            {props.admin ? <p>route: {props.address.route_name}</p> : <div></div>}
        </div>
    )
}   

export default PropertyCard

