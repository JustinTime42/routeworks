import React from 'react'
import { Button } from 'react-bootstrap'

const PropertyCard = (props) => {
    const cardStyle = {
        margin: '3px',
        padding: '3px',
        width: props.width,
        backgroundColor: props.activeProperty ? props.activeProperty.address === props.address.address ? '#DCBD61' : '#BCD4DE' : null
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
        backgroundColor: props.address.status === "waiting" ? "yellow" : 
        props.address.status === "skipped" ? "red" :
        props.address.status === "done" ? "green" : null
    }

    const editStyle = {
        verticalAlign: "bottom"
    }


    return(
        <div style={cardStyle} onClick={() => props.handleClick(props.address)}>
            <div style={rightStyle}>
                {props.address.status ? 
                    <p style={statusStyle}>{props.address.status}</p>  : <p style={statusStyle}></p>             
                } 
                {props.admin === true ? 
                    <p style={editStyle}><Button variant="secondary" onClick={() => props.editClick()}>Edit </Button></p>  : <p></p>               
                }
            </div>

            <p style={{textAlign: "left", width: "100%"}}>
                {props.address.cust_name}                
            </p>                             
            <p>{props.address.address}</p>            
            {props.admin ? <p>route: {props.address.route_name}</p> : <div></div>}
        </div>
    )
}   

export default PropertyCard

