import React from 'react'
import Card from "react-bootstrap/Card"

const PropertyCard = (props) => {

    return(
        <div onClick={() => props.handleClick(props.address)}>
            <p>{props.address.address}</p>
            <p>{props.address.cust_name}</p>
            {props.admin ? <p>route: {props.address.route_name}</p> : <div></div>}
              
            

            
                  
        </div>
    )
}   

export default PropertyCard

