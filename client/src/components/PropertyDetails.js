import React from 'react'
import { Card } from 'react-bootstrap'

import '../styles/driver.css'

const PropertyDetails = (props) => {
    return (
        <Card>
            <Card.Title>{props.property ? props.property.address : null}</Card.Title>
            <Card.Subtitle>{props.property ? props.property.cust_name : null}</Card.Subtitle>
        </Card>
    )
}

export default PropertyDetails