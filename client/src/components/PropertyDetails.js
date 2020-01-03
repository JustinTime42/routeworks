import React, { Component } from 'react'
import { connect } from "react-redux"
import { Card, Col, Row, Button, Form } from 'react-bootstrap'
import axios from 'axios'
import { getRouteProperties } from "../actions"

import '../styles/driver.css'

const mapStateToProps = state => {
    return {
        property: state.setActiveProperty.activeProperty,
        driver: state.setDriverName.driverName,
        activeRoute: state.setActiveRoute.activeRoute,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onGetRouteProperties: (route) => dispatch(getRouteProperties(route))        
    }
}

class PropertyDetails extends Component {
    constructor(props){
        super(props)
        this.state = {
            noteField: ''
        }
    }
    
    componentDidUpdate(prevProps) {
        if(prevProps.property !== this.props.property){
          this.setState({noteField: ''})
        }
      }

    onNoteChange = (event) => {
        this.setState({noteField: event.target.value})
        console.log(this.state.noteField)
        console.log(this.props.driver)
    }

    onStatusChange = (status) => {
        axios.post(`https://snowline-route-manager.herokuapp.com/api/setstatus`, 
            {
                property: this.props.property,
                newStatus: status,
                driver: this.props.driver,
                noteField: this.state.noteField
            }
        )
        .then(res => {
            this.props.onGetRouteProperties(this.props.activeRoute) 
            console.log(res)
        })
        .catch(err => console.log(err)) 
    }

    render() {
        const property = this.props.property
        return (
            property ?
            <Card style={{padding: "1em", height: "600px"}}>
                <Row>
                    <Col>
                        <Card.Title>{property ? property.address ? property.address : null : null}</Card.Title>
                    </Col>
                    <Col><Card.Title style={{textAlign: "right"}}>{property ? property.surface_type ? <p>Surface:<br></br>{property.surface_type}</p> : null : null }</Card.Title></Col>
                </Row>
                
                <Card.Body>
                    <Card.Title>{property ? property.cust_name ? property.cust_name : null : null}{this.props.address? this.props.address.is_new ? " (NEW)" : null : null}</Card.Title>
                    <Card.Subtitle>{this.props.property ? this.props.property.cust_phone ? this.props.property.cust_phone : null : null}</Card.Subtitle>
                </Card.Body>                
                {property ? property.notes ? <Card.Body><Card.Subtitle>Notes:</Card.Subtitle><Card.Text className="scrollable" style={{height: "100%", overflow: "scroll"}}>{property.notes}</Card.Text></Card.Body> : null : null }
                <Card.Body>
                <Form.Group>
                    <Form.Label>Driver Notes</Form.Label>
                    <Form.Control name="notes" as="textarea" rows="3" value={this.state.noteField} onChange={this.onNoteChange}/>
                </Form.Group>
                </Card.Body>
                <Card.Body style={{marginTop: "1em", verticalAlign: "bottom", display:"flex", alignItems: "flex-end", justifyContent: "space-between"}}>
                    <Button variant="primary" onClick={() => this.props.changeProperty(property.route_position - 1)} >Prev</Button>
                    <Button variant="warning" onClick={() => this.onStatusChange('Skipped')}>Skip</Button>
                    <Button variant="success" onClick={() => this.onStatusChange('Done')}>Done</Button>
                    <Button variant="primary" onClick={() => this.props.changeProperty(property.route_position  + 1)} >Next</Button>
                </Card.Body>
            </Card> : null
        )
    
    }
        
    
}

export default connect(mapStateToProps, mapDispatchToProps)(PropertyDetails)