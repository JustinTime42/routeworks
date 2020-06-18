import React, { Component } from 'react'
import { connect } from "react-redux"
import { Card, Col, Row, Button, Form, Dropdown, DropdownButton } from 'react-bootstrap'
import axios from 'axios'
import { getRouteProperties } from "../actions"

import '../styles/driver.css'
import DropdownItem from 'react-bootstrap/DropdownItem'

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
            work_type: 'snow removal',
            yards: 1,
        }
    }
    
    componentDidUpdate(prevProps) {
        if(prevProps.property !== this.props.property || prevProps.activeRoute !== this.props.activeRoute){
          this.setState({noteField: '', yards: 1, work_type: 'snow removal'})
        }
      }

    onTextChange = (event) => {
        this.setState({[event.target.name]: event.target.value})
    }

    setWorkType = (event) => {
        this.setState({work_type: event})
    }

    onStatusChange = (newStatus) => {
        /*
        if work_type = sanding, price is pricePerYard * yards  (price per yard defaults to customer price, yards defaults to 1)
        else if contract_type is seasonal or monthly and work type = snow removal, price is 0 (price will be pulled separately if monthly)

        If the contract type is 5030 or per occurance, price = price. no modifications needed. You'll have to put '30' or the modified per visit cost in the price field for 5030 customers
        monthly customers will likewise get billed monthly, the per visit line item will be $0
        */
        this.setState({disabled: true})
        let property = {...this.props.property}
        if (this.state.work_type === 'sanding') {
            property.price = property.price_per_yard * this.state.yards
        } else if ((property.contract_type === 'seasonal' || 'monthly') && (this.state.work_type === 'snow removal')) {
            console.log('returning 0, contract_type, work type', property.contract_type, this.state.work_type)
            property.price = 0   // why does this keep returning 0
        }
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
                    <Row>
                        <Col>
                            <Card.Title>{property ? property.cust_name ? property.cust_name : null : null}{this.props.address? this.props.address.is_new ? " (NEW)" : null : null}</Card.Title>
                            <Card.Subtitle>{this.props.property ? this.props.property.cust_phone ? this.props.property.cust_phone : null : null}</Card.Subtitle>
                        </Col>
                        <Col>
                            <Form.Label>Work Type</Form.Label>
                            <DropdownButton title={this.state.work_type} onSelect={this.setWorkType}>
                                <Dropdown.Item key="sanding" eventKey="sanding">sanding</Dropdown.Item>
                                <DropdownItem key="snow removal" eventKey="snow removal">snow removal</DropdownItem> 
                            </DropdownButton> 
                            {
                                this.state.work_type === 'sanding' ?
                                <Form.Group>
                                    <Form.Label>Number of Yards</Form.Label>
                                    <Form.Control name="yards" as="textarea" rows="1" value={this.state.yards} onChange={this.onTextChange}/>
                                </Form.Group> : null
                            }                            
                        </Col>
                    </Row>
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
                    <Form.Control name="noteField" as="textarea" rows="3" value={this.state.noteField} onChange={this.onTextChange}/>
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