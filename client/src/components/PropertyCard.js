import React from 'react'
import { Button } from 'react-bootstrap'

const PropertyCard = (props) => {
    let test = false
    let status = props.address.status
    if (props.address.route_name !== "unassigned" && !props.address.status) {
        status = "waiting"
    }

    const cardStyle = {
        margin: '3px',
        padding: '3px',
        width: props.width,
        backgroundColor: props.activeProperty ? props.activeProperty.address === props.address.address ? '#4E8098' : '#303030   ' : null
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
        backgroundColor: status === "waiting" ? `rgba(255,200,0,0.9)` : 
        status === "Skipped" ? `rgba(255,0,0,0.7)` :
        status === "Done" ? `rgba(0,255,0,0.7)` : null
    }

    const editStyle = {
        verticalAlign: "bottom"
    }


    return(
        <div style={cardStyle} onClick={() => props.handleClick(props.address)}>
            <div style={rightStyle}>
                {props.address.route_name !== "unassigned" ? 
                    <p style={statusStyle}>{status}</p> : <p style={statusStyle}></p>             
                } 
                {props.admin === true ? 
                    <p style={editStyle}><Button variant="secondary" onClick={() => props.editClick(props.address)}>Edit </Button></p>  : <p></p>               
                }
            </div>

            <p style={{textAlign: "left", width: "100%"}}>
            {props.address.cust_name}{props.address.is_new ? " (NEW)" : null}            
            </p>                             
            <p>{props.address.address}</p>            
            {props.admin ? <p>route: {props.address.route_name}</p> : <div></div>}
        </div>
    )
}   

export default PropertyCard

