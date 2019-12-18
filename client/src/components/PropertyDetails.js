import React from 'react'
import { Card, Container, Col, Row } from 'react-bootstrap'

import '../styles/driver.css'

const PropertyDetails = (props) => {
    return (
        <Card style={{padding: "1em"}}>
            <Row>
                <Col>
                    <Card.Title>{props.property.address ? props.property.address : null}</Card.Title>
                </Col>
                <Col><Card.Title style={{textAlign: "right"}}>{props.property.surface_type ? props.property.surface_type : null }</Card.Title></Col>
            </Row>
            
            <Card.Body>
                <Card.Title>{props.property.cust_name ? props.property.cust_name : null}{props.address? props.address.is_new ? " (NEW)" : null : null}</Card.Title>
                <Card.Subtitle>{props.property.cust_phone ? props.property.cust_phone : null}</Card.Subtitle>
            </Card.Body>            
            <Card.Body>
                <Card.Subtitle>Notes:</Card.Subtitle>
                <Card.Text>{props.property.notes}</Card.Text>
            </Card.Body>
        </Card>
    )
}

export default PropertyDetails