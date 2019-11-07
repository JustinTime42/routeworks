import React from 'react'
import Card from "react-bootstrap/Card"

const PropertyCard = (props) => {
    function handleClick(){
        console.log(props.address.address)
    }
    
    return(
        <Card onClick={handleClick}>
            <Card.Body>
                <Card.Text>{props.address.address}</Card.Text>
                <Card.Text>{props.address.cust_name}</Card.Text>
            </Card.Body>
        </Card>
    )
}   

export default PropertyCard

