import React from 'react'
import Card from "react-bootstrap/Card"



const PropertyCard = (props) => {
    const cardStyle = {
        margin: '3px',
        padding: '3px',
        width: '90%',
        backgroundColor: props.activeProperty ? props.activeProperty.address == props.address.address ? '#DCBD61' : '#BCD4DE' : null
    }

    return(
        <div style={cardStyle} onClick={() => props.handleClick(props.address)}>
            <p>{props.address.cust_name}</p>
            <p>{props.address.address}</p>            
            {props.admin ? <p>route: {props.address.route_name}</p> : <div></div>}
        </div>
    )
}   

export default PropertyCard

