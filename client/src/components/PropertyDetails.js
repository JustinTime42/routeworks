import React, { Component } from 'react'
import { connect } from "react-redux"
import { Card, Col, Row, Button, Form } from 'react-bootstrap'
import axios from 'axios'
import { getRouteProperties } from "../actions"

import '../styles/driver.css'

const mapStateToProps = state => {
    return {
        property: state.setActiveProperty.activeProperty,
        driver: state.setActiveDriver.driver,
        tractor: state.setTractorName.tractorName,
        activeRoute: state.setActiveRoute.activeRoute,
        routePending: state.getRouteProperties.isPending,
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
            noteField: '',
            disabled: false,
        }
    }
    
    componentDidUpdate(prevProps) {
        if(prevProps.property !== this.props.property || prevProps.activeRoute !== this.props.activeRoute){
          this.setState({noteField: ''})
        }
      }

    onNoteChange = (event) => {
        this.setState({noteField: event.target.value})
    }

    onStatusChange = (newStatus) => {
            this.setState({disabled: true})
            let property = this.props.property
            property.route_data.find(route => route.route_name === this.props.activeRoute).status = newStatus
            console.log(property)
            axios.post(`${process.env.REACT_APP_API_URL}/setstatus`, 
                {
                    property: property,
                    status: newStatus,
                    driver: this.props.driver,
                    noteField: this.state.noteField,
                    tractor: this.props.tractor
                }
            )
            .then(res => {
                this.props.onGetRouteProperties(this.props.activeRoute) 
                console.log(res)
                if (res.data.err.length > 0) alert(res.data.err)
                this.setState({disabled: false})
            })
            .catch(err => alert(err)) 
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
                    <Col><Card.Title style={{textAlign: "right"}}>{property ? property.surface_type ? <p>Surface:<br></br>{property.surface_type.toUpperCase()}</p> : null : null }</Card.Title></Col>
                </Row>
                <Card.Body>
                    <Card.Title>{property ? property.cust_name ? property.cust_name : null : null}{this.props.address? this.props.address.is_new ? " (NEW)" : null : null}</Card.Title>
                    <Card.Subtitle>{this.props.property ? this.props.property.cust_phone ? this.props.property.cust_phone : null : null}</Card.Subtitle>
                </Card.Body>        
                <Card.Body>
                    <Card.Title>{property ? property.is_new ? "NEW" : null : null}</Card.Title>
                    <Card.Title>{property ? property.seasonal ? "SEASONAL" : null : null}</Card.Title>
                    <Card.Title>{property ? !!property.temp ? "TEMPORARY" : null : null}</Card.Title>
                </Card.Body>        
                {property ? property.notes ? <Card.Body><Card.Subtitle>Notes:</Card.Subtitle><Card.Text className="scrollable" style={{height: "100%", overflow: "scroll"}}>{property.notes}</Card.Text></Card.Body> : null : null }
                <Card.Body>
                <Form.Group>
                    <Form.Label>Driver Notes</Form.Label>
                    <Form.Control name="notes" as="textarea" rows="3" value={this.state.noteField} onChange={this.onNoteChange}/>
                </Form.Group>
                </Card.Body>
                <Card.Body style={{marginTop: "1em", verticalAlign: "bottom", display:"flex", alignItems: "flex-end", justifyContent: "space-between"}}>
                    <Button variant="primary" size="lg" onClick={() => this.props.changeProperty("prev")} >Prev</Button>
                    <Button variant="danger" size="lg" disabled={this.props.routePending || this.state.disabled} onClick={() => this.onStatusChange('Skipped')}>Skip</Button>
                    <Button variant="success" size="lg" disabled={this.props.routePending || this.state.disabled} onClick={() => this.onStatusChange('Done')}>Done</Button>
                    <Button variant="primary" size="lg" onClick={() => this.props.changeProperty("next")} >Next</Button>
                </Card.Body>
            </Card> : null
        )
    
    }
        
    
}

export default connect(mapStateToProps, mapDispatchToProps)(PropertyDetails)