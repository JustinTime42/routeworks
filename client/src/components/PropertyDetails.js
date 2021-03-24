import React, { Component } from 'react'
import { connect } from "react-redux"
import { Tabs, Tab, Card, Col, Row, Button, Form, Dropdown, DropdownButton, Alert } from 'react-bootstrap'
import axios from 'axios'
import { getRouteData, requestAllAddresses } from "../actions"
import CustLogs from './customer_panels/CustLogs'
import SkipDetails from './customer_panels/SkipDetails'

import '../styles/driver.css'

const mapStateToProps = state => {
    return {
        driver: state.setActiveDriver.driver,
        tractor: state.setTractorName.tractorName,
        activeRoute: state.setActiveRoute.activeRoute,
        routePending: state.getRouteProperties.isPending,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        getRouteData: () => dispatch(getRouteData()),
        getAllAddresses: () => dispatch(requestAllAddresses())      
    }
}

class PropertyDetails extends Component {
    constructor(props){
        super(props)
        this.state = {
            noteField: '',
            disabled: false,
            work_type: 'snow removal',
            yards: '0',
            done_label: "hidden",
            newStatus: '',
            showSkipConfirmation: false,
        }
    }
    
    componentDidUpdate(prevProps) {
        if(prevProps.property !== this.props.property || prevProps.activeRoute !== this.props.activeRoute){
          this.setState({noteField: '', yards: '0', work_type: 'Snow Removal', done_label: "hidden", disabled: false, showSkipConfirmation: false,})
        }
      }

    onTextChange = (event) => (this.setState({[event.target.name]: event.target.value}))

    setWorkType = (event) => (this.setState({work_type: event}))

    toggleShowSkip = () => this.setState(prevState => ({showSkipConfirmation: !prevState.showSkipConfirmation}))

    setSkipReason = (event) => {
        this.setState({skipReason: event})
    }

    onStatusChange = (newStatus, skipDetails='') => {
        this.setState({disabled: true})
        let property = {...this.props.property}
       
        if (this.state.work_type === 'Sanding') {
            property.sand_contract === "Per Yard" ? property.price = property.price_per_yard * this.state.yards : property.price = property.price_per_yard
        } else if (this.state.work_type === 'Sweeping') {
            property.price = property.sweep_price
        } else if ((property.contract_type === 'Seasonal' || property.contract_type === 'Monthly') && (this.state.work_type === 'Snow Removal')) {            
            property.price = 0  
        }
        axios.post(`${process.env.REACT_APP_API_URL}/setstatus`, 
            {
                property: property,
                status: newStatus,
                driver: this.props.driver,
                route: this.props.activeRoute,
                noteField: newStatus === 'Skipped' ? this.state.noteField + skipDetails : this.state.noteField,
                tractor: this.props.tractor,
                work_type: this.state.work_type,
                yards: this.state.yards,
            }
        )
        .then(res => {
            this.props.getRouteData() 
            console.log(res)
            let confirmedStatus = res.data.route_data.status
            if ( confirmedStatus = newStatus) {
                this.setState({done_label: "visible", newStatus:confirmedStatus, showSkipConfirmation: false})
            } else alert(confirmedStatus)
            if (res.data.err.length > 0) alert(res.data.err)            
        })
        .catch(err => alert(err)) 
    }

    render() {
        const property = this.props.property
        return (
            property ?
            <Tabs defaultActiveKey='job'>
                <Tab eventKey='job' title='Job'>
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
                                        <Dropdown.Item key="Sanding" eventKey="Sanding">sanding</Dropdown.Item>
                                        <Dropdown.Item key="Snow Removal" eventKey="Snow Removal">snow removal</Dropdown.Item>
                                        <Dropdown.Item key="Sweeping" eventKey="Sweeping">sweeping</Dropdown.Item> 
                                        <Dropdown.Item key="Other" eventKey="Other">other</Dropdown.Item>
                                    </DropdownButton> 
                                    {
                                        this.state.work_type === 'Sanding' && property.sand_contract === "Per Yard" ?
                                        <Form.Group>
                                            <Form.Label>Number of Yards</Form.Label>
                                            <Form.Control name="yards" as="input" type="number" rows="1" value={this.state.yards} onChange={this.onTextChange}/>
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
                        {property ? property.notes ? <Card.Body><Card.Subtitle>Notes:</Card.Subtitle><Card.Title className="scrollable" style={{height: "100%", overflow: "scroll"}}>{property.notes}</Card.Title></Card.Body> : null : null }
                        <Card.Body>
                        <Form.Group>
                            <Form.Label>Driver Notes</Form.Label>
                            <Form.Control name="noteField" as="textarea" rows="3" value={this.state.noteField} onChange={this.onTextChange}/>
                        </Form.Group>
                        </Card.Body>
                        <Card.Body style={{marginTop: "1em", verticalAlign: "bottom", display:"flex", alignItems: "center", justifyContent: "space-between"}}>
                            <Button variant="primary" size="lg" disabled={!property.routeName} onClick={() => this.props.changeProperty(property, "prev")} >Prev</Button>
                            <Button variant="danger" size="lg" disabled={this.props.routePending || this.state.disabled} onClick={this.toggleShowSkip}>Skip</Button>
                                <div style={{visibility: this.state.done_label, fontSize: "large"}}>{this.state.newStatus}!</div>
                            <Button variant="success" size="lg" disabled={this.props.routePending || this.state.disabled || (property.sand_contract === "Per Yard" && this.state.yards === '0' && this.state.work_type === "Sanding")} onClick={() => this.onStatusChange('Done')}>Done</Button>
                            <Button variant="primary" size="lg" disabled={!property.routeName} onClick={() => this.props.changeProperty(property, "next")} >Next</Button>
                        </Card.Body>
                        <Card.Body>
                            <SkipDetails 
                                show={this.state.showSkipConfirmation}
                                toggleShowSkip={this.toggleShowSkip}
                                onStatusChange={this.onStatusChange}
                                customer={property} 
                            />                            
                        </Card.Body>
                    </Card>
                </Tab>
                <Tab eventKey='logs' title='Logs'>
                    {this.props.property ? <CustLogs style={{padding: "1em", height: "600px"}}/> : null }                    
                </Tab>

            </Tabs>
             : null
        )    
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PropertyDetails)