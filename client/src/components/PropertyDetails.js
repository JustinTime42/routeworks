import React, { Component } from 'react'
import { connect } from "react-redux"
import { Tabs, Tab, Card, Col, Row, Button, Form, Dropdown, DropdownButton, Alert, Modal } from 'react-bootstrap'
import axios from 'axios'
import { getRouteData, requestAllAddresses } from "../actions"
import CustLogs from './customer_panels/CustLogs'
import SkipDetails from './customer_panels/SkipDetails'
import TimeTracker from './customer_panels/TimeTracker'

import '../styles/driver.css'

const mapStateToProps = state => {
    return {
        driver: state.setActiveDriver.driver,
        tractor: state.setActiveTractor.activeTractor,
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

const initialState = {
    noteField: '',
    disabled: false,
    work_type: 'Snow Removal',
    yards: '0',
    done_label: "hidden",
    newStatus: '',
    showSkipConfirmation: false,
    currentLogEntry: null,
    showUndoConfirmation: false,
    timeElapsed: 0,
    showModal: false,
    isRunning: false,
}


class PropertyDetails extends Component {
    constructor(props){
        super(props)
        this.state = initialState
    }
    
    componentDidUpdate(prevProps) {
        if(prevProps.property !== this.props.property || prevProps.activeRoute !== this.props.activeRoute){
            if (this.props.property.contract_type === "Hourly") {
                this.setState({...initialState, disabled: true, showModal: true}, () => {                    
                    setTimeout(() => alert("Remember to log hours!"), 200) 
                } )                                                        
            } else this.setState(initialState)
        }
      }

      //componentdidmount if property.contract_type === hourly, set setState disabled:true
      

    onTextChange = (event) => (this.setState({[event.target.name]: event.target.value}))

    setWorkType = (event) => (this.setState({work_type: event}))

    toggleShowSkip = () => this.setState(prevState => ({showSkipConfirmation: !prevState.showSkipConfirmation}))

    setSkipReason = (event) => this.setState({skipReason: event})

    onCloseClick = () => {
        if(!this.state.isRunning) this.setState((prevState) => ({showModal: !prevState.showModal}))
    } 

    setIsRunning = (isRunning) => this.setState({isRunning:isRunning})
    
    undoStatus = () => {
       // this.onStatusChange('Waiting')
        axios.delete(`${process.env.REACT_APP_API_URL}/undo/${this.state.currentLogEntry}`)
        .then(res => {
            console.log(res)
            this.setState({showUndoConfirmation: false, currentLogEntry: null, done_label: "hidden", disabled: false})
            this.props.getRouteData()
        })
        .catch(err => alert(err))
    }

    onStatusChange = (newStatus, skipDetails='', startTime=null, endTime=null, disabled=true) => {
        this.setState({disabled: disabled})
        let property = {...this.props.property}
       
        if (this.state.work_type === 'Sanding') {
            (property.sand_contract === "Per Yard" || property.contract_type === "Hourly") ? property.price = property.price_per_yard * this.state.yards : property.price = property.price_per_yard
        } else if (property.contract_type === 'Hourly') {
            let timeLogged = endTime - startTime
            console.log(timeLogged)

            //so now that we've properly handled sanding, we need to calculate hourly pay
            // multiply vehicle hourly rate by time elapsed. 
            // first i need 
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
                noteField: newStatus === 'Skipped' ? this.state.noteField + ' ' + skipDetails : this.state.noteField,
                tractor: this.props.tractor,
                work_type: this.state.work_type,
                yards: this.state.yards,
                startTime: startTime, 
                endTime: endTime,
            }
        )
        .then(res => {
            this.props.getRouteData() 
            console.log(res.data)
            console.log(res.data.serviceLog[0][0].key)
            let confirmedStatus = res.data.route_data[0].status
            // get confirmedPriorty = res.data.property.priority....?
            // then insert priority into the aproperty within alladdresses... will need to make sure that updates the route properties
            //  
            if (confirmedStatus === newStatus) {
                this.setState({done_label: confirmedStatus === "Waiting" ? "hidden" : "visible", newStatus:confirmedStatus, showSkipConfirmation: false, currentLogEntry: res.data.serviceLog[0][0].key})
            } else alert("confirmed status error: ", confirmedStatus)
            if (res.data.err.length > 0) {
                console.log("Confirm ERROR", res.data.err)
                alert(res.data.err)
            }
        })
        .catch(err => {
            console.log("ERROR", err)
            alert(err)
        })
    }

    DetailsPanel = (props) => {
        return (
            props.property?.contract_type === "Hourly" ? 
            <Modal show={this.state.showModal} onHide={this.onCloseClick} backdrop='static' size='lg'>
                <Modal.Header closeButton></Modal.Header>
                {props.children}
            </Modal> :
            <div className='rightside'> {props.children} </div>
        )
    }

    render() {
        const property = this.props.property
        return (
            this.props.property ? 
                <this.DetailsPanel property={this.props.property}>
                    <Tabs defaultActiveKey='job'>
                        <Tab style={{padding: "1em", height:'75vh', overflow:'hide'}} eventKey='job' title='Job'>
                            <Row>
                                <Col>
                                    <h3>{property?.cust_name}</h3>
                                    <h4>{property?.address}</h4>
                                    <p>phone: {property?.cust_phone}</p>
                                </Col>
                                <Col>
                                    <h4 style={{textAlign:"right"}}>Surface: {property?.surface_type?.toUpperCase()}</h4>
                                        <h4 style={{textAlign:"right"}}>Work Type</h4>
                                        <DropdownButton  style={{textAlign:"right"}} title={this.state.work_type} onSelect={this.setWorkType}>
                                            <Dropdown.Item key="Sanding" eventKey="Sanding">Sanding</Dropdown.Item>
                                            <Dropdown.Item key="Snow Removal" eventKey="Snow Removal">Snow Removal</Dropdown.Item>
                                            <Dropdown.Item key="Sweeping" eventKey="Sweeping">Sweeping</Dropdown.Item> 
                                            <Dropdown.Item key="Other" eventKey="Other">Other</Dropdown.Item>
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
                            <Card.Body>
                                <Card.Title>{property ? property.is_new ? "NEW" : null : null}</Card.Title>
                                <Card.Title>{property ? !!property.temp ? "TEMPORARY" : null : null}</Card.Title>
                            </Card.Body>        
                            {property ? property.notes ? <Card.Body><Card.Subtitle>Notes:</Card.Subtitle><Card.Title className="scrollable" style={{height: "100%", overflow: "scroll"}}>{property.notes}</Card.Title></Card.Body> : null : null }
                            <Card.Body>
                            <Form.Group>
                                <Form.Label>Driver Notes</Form.Label>
                                <Form.Control name="noteField" as="textarea" rows="3" value={this.state.noteField} onChange={this.onTextChange}/>
                            </Form.Group>
                            </Card.Body>
                            {
                                property.contract_type === "Hourly" ? <TimeTracker onStatusChange={this.onStatusChange} isRunning={this.state.isRunning} setIsRunning={this.setIsRunning}/> : null 
                            }
                            <Card.Body className='buttonRowStyle'>
                                <Button variant="primary" size="lg" disabled={!property.routeName || this.state.isRunning} onClick={() => this.props.changeProperty(property, "prev")} >Prev</Button>
                                <Button variant="danger" size="lg" disabled={this.props.routePending || this.state.disabled || this.state.isRunning} onClick={this.toggleShowSkip}>Skip</Button>
                                    <div style={{visibility: this.state.done_label, fontSize: "large"}}>                                    
                                        <Button variant='warning' size='lg' onClick={() => this.setState({showUndoConfirmation: true})} >Undo {this.state.newStatus}</Button>
                                    </div>
                                <Button variant="success" size="lg" disabled={this.state.isRunning || this.props.routePending || this.state.disabled || (property.sand_contract === "Per Yard" && this.state.yards === '0' && this.state.work_type === "Sanding")} onClick={() => this.onStatusChange('Done')}>Done</Button>
                                <Button variant="primary" size="lg" disabled={!property.routeName || this.state.isRunning} onClick={() => this.props.changeProperty(property, "next")} >Next</Button>
                            </Card.Body>
                            <Card.Body>
                                <SkipDetails
                                    show={this.state.showSkipConfirmation}
                                    toggleShowSkip={this.toggleShowSkip}
                                    onStatusChange={this.onStatusChange}
                                    customer={property} 
                                />    
                                <Alert show={this.state.showUndoConfirmation} variant="danger">
                                    <Alert.Heading>Undo {this.state.newStatus} and set as 'Waiting'?</Alert.Heading>
                                    <Button size='lg' onClick={() => this.setState({showUndoConfirmation: false})}>Cancel</Button>
                                    <Button size='lg' onClick={this.undoStatus}>Confirm</Button>
                                </Alert>                        
                            </Card.Body>
                        </Tab>
                        <Tab eventKey='logs' title='Logs'>
                            <CustLogs height="80vh"/>                  
                        </Tab>
                    </Tabs>
                </this.DetailsPanel> : null
        )    
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PropertyDetails)