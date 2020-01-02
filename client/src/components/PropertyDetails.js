import React from 'react'
import { Card, Container, Col, Row, Button } from 'react-bootstrap'

import '../styles/driver.css'

const PropertyDetails = (props) => {
    return (
        props.property ?
        <Card style={{padding: "1em", height: "100%"}}>
            <Row>
                <Col>
                    <Card.Title>{props.property ? props.property.address ? props.property.address : null : null}</Card.Title>
                </Col>
                <Col><Card.Title style={{textAlign: "right"}}>{props.property ? props.property.surface_type ? props.property.surface_type : null : null }</Card.Title></Col>
            </Row>
            
            <Card.Body>
                <Card.Title>{props.property ? props.property.cust_name ? props.property.cust_name : null : null}{props.address? props.address.is_new ? " (NEW)" : null : null}</Card.Title>
                <Card.Subtitle>{props.property ? props.property.cust_phone ? props.property.cust_phone : null : null}</Card.Subtitle>
            </Card.Body>
            {props.property ? props.property.notes ? <Card.Body><Card.Subtitle>Notes:</Card.Subtitle><Card.Text>{props.property.notes}</Card.Text></Card.Body> : null : null }
            <Card.Body style={{verticalAlign: "bottom", display:"flex", alignItems: "flex-end", justifyContent: "space-between"}}>
                <Button variant="primary" onClick={() => props.changeProperty(props.property.route_position - 1)} >Prev</Button>
                <Button variant="warning">Skip</Button>
                <Button variant="success">Done</Button>
                <Button variant="primary" onClick={() => props.changeProperty(props.property.route_position  + 1)} >Next</Button>
            </Card.Body>
        </Card> : null
    )
}

export default PropertyDetails