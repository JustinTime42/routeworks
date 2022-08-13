import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { Tabs, Tab, Card, Col, Row, Button, Form, Alert, Modal } from 'react-bootstrap'
import axios from 'axios'
import { getRouteData, createItem, editItem} from "../actions"
import { REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE } from '../constants';
import CustLogs from './customer_panels/CustLogs'
import SkipDetails from './customer_panels/SkipDetails'
import TimeTracker from './customer_panels/TimeTracker'

import '../styles/driver.css'

const initialState = {
    noteField: '',
    disabled: false,
    yards: 0,
    done_label: "hidden",
    newStatus: '',
    showSkipConfirmation: false,
    currentLogEntry: null,
    showUndoConfirmation: false,
    showModal: false,
    isRunning: false,
}

const PropertyDetails = (props) => {

    const [
        {noteField, disabled, yards, done_label, newStatus, showSkipConfirmation, currentLogEntry, showUndoConfirmation, showModal, isRunning},
        setState
    ] = useState(initialState)

    const driver = useSelector(state => state.setActiveDriver.driver)
    const tractor = useSelector(state => state.setActiveTractor.activeTractor)
    const tractorType = useSelector(state => state.setActiveTractor.type)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routePending = useSelector(state => state.getRouteProperties.isPending)
    const routes = useSelector(state => state.requestRoutes.routes)
    const workType = useSelector(state => state.setActiveWorkType.workType)
    const dispatch = useDispatch()

    useEffect(() => {
        console.log("active property: ", props.property)
        if (props.property?.contract_type === "Hourly") { 
            console.log("active property is hourly")
            setState(() => ({...initialState, disabled: true, showModal: true})) 
        } else setState(initialState)
    }, [props.property, activeRoute])

    useEffect(() => {
        if (showModal) {
            setTimeout(() => alert("Remember to log hours!"), 200) 
            console.log("showModal: ") 
        }
    },[showModal])

    const onTextChange = (event) => {
        let {target: {name, value} } = event
        if (name === "yards") {
            value = Number(value)
            if (isNaN(value)) {
                return
            }
        }
        console.log(value)
        setState(prevState => ({ ...prevState, [name]: value}))
    } 

    const toggleShowSkip = () => setState(prevState => ({...prevState, showSkipConfirmation: !prevState.showSkipConfirmation}))

    const onCloseClick = () => {
        if(!isRunning) setState((prevState) => ({...prevState, showModal: false}))
    } 

    const setIsRunning = (isRunning) => setState(prevState => ({...prevState, isRunning:isRunning}))
    
    const undoStatus = () => {
        axios.delete(`${process.env.REACT_APP_API_URL}/undo/${currentLogEntry}`)
        .then(res => {
            console.log(res)
            setState(prevState => ({...prevState, showUndoConfirmation: false, currentLogEntry: null, done_label: "hidden", disabled: false}))
           dispatch(getRouteData())
        })
        .catch(err => alert(err))
    }

    const onStatusChange = (newStatus, skipDetails='', startTime=null, endTime=null, disabled=true) => {
        console.log(tractor)
        setState(prevState => ({...prevState, disabled: disabled}))
        let property = {...props.property}
        let newRecordObject = {}
        newRecordObject.status = newStatus
        newRecordObject.price = property.price
        let month = new Date().getMonth() + 1
        let year = new Date().getFullYear().toString().substr(-2)
        // round down to the nearest minute. and then up to the nearest quarter hour
        let timeLogged = Math.ceil(Math.floor((endTime - startTime) / 60000) / 15) / 4
        
        newRecordObject.driverEarning = driver.percentage * .01 * property.value
        let yardString = (yards !== 0) ? ": " + yards + " yds" : ""
        if (property.contract_type === 'Hourly') {
            newRecordObject.driverEarning = timeLogged * driver.hourly
        }
        if (workType.name === 'Sanding') {            
            (property.sand_contract === "Per Yard" || property.contract_type === "Hourly") ? newRecordObject.price = property.price_per_yard * yards : newRecordObject.price = property.price_per_yard
        } else if (property.contract_type === 'Hourly') {
            newRecordObject.price = timeLogged * property[tractor.type]
        } else if (workType.name === 'Sweeping') {
            newRecordObject.price = property.sweep_price
        } else if ((property.contract_type === 'Seasonal' || property.contract_type === 'Monthly') && (workType.name === 'Snow Removal')) {            
            newRecordObject.price = 0  
        }
        if (property.contract_type === "Hourly") { 
            newRecordObject.status = 'Hourly'
        }
        
        newRecordObject.cust_id = property.id
        newRecordObject.reference = property.address
        newRecordObject.address = property.address
        newRecordObject.cust_name = property.cust_name
        newRecordObject.driver = driver.name
        newRecordObject.notes = newRecordObject.status === 'Skipped' ? noteField + ' ' + skipDetails : noteField
        newRecordObject.tractor = tractor.name
        newRecordObject.vehicle_type = tractor.type
        newRecordObject.work_type = workType.name
        newRecordObject.price = property.price
        if (yards) {newRecordObject.yards = (yards !== 0) ? ": " + yards + " yds" : ""}
        if (startTime) {newRecordObject.startTime = startTime}
        if (endTime) {newRecordObject.endTime = endTime} 
        newRecordObject.description = newRecordObject.status === 'Skipped' ? '' : workType.name + yardString
        newRecordObject.invoice_number = `${property.id.substring(0,5)}A${year}${month}`
        if (property.price_per_yard) {newRecordObject.price_per_yard = property.price_per_yard}
        if (property[tractor.type]) {newRecordObject.hourly_rate = property[tractor.type]} 
        const newRoute = {...activeRoute}
        newRoute.customers[newRoute.customers.findIndex(i => i.id === property.id)].status = newStatus
        console.log(newRecordObject.driverEarning)
        dispatch(createItem(newRecordObject, null, 'service_logs', null, null))

        // editItem to make change status on current route
        dispatch(editItem(newRoute, routes, 'driver/driver_lists/route', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))

        // axios.post(`${process.env.REACT_APP_API_URL}/setstatus`, 
        //     {
        //         cust_id: property.id,
        //         reference: property.address,
        //         address: property.address, 
        //         cust_name: property.cust_name,   
        //         status: status,
        //         driver: driver.name,
        //         notes: status === 'Skipped' ? noteField + ' ' + skipDetails : noteField,
        //         tractor: tractor.name,
        //         vehicle_type: tractorType.name, 
        //         work_type: workType.name,
        //         price: property.price,
        //         yards: (yards !== 0) ? ": " + yards + " yds" : "",
        //         startTime: startTime, 
        //         endTime: endTime,
        //         driver_earning: driverEarning,
        //         description: status === 'Skipped' ? '' : work_type + yardString,
        //         invoice_number: `A${property.key}${year}${month}`,
        //         price_per_yard: property.price_per_yard,
        //         hourly_rate: property[tractorType.name]
        //     }
        // )
        // .then(res => {
        //     dispatch(getRouteData())
        //     console.log(res.data)
        //     console.log(res.data.serviceLog[0][0].key)
        //     let confirmedStatus = res.data.serviceLog[0][0].status
        //     // get confirmedPriorty = res.data.property.priority....?
        //     // then insert priority into the aproperty within alladdresses... will need to make sure that updates the route properties
        //     //  
        //     if (confirmedStatus === status) {
                setState(prevState => ({
                    ...prevState, 
                    done_label: (confirmedStatus === "Waiting" || property.contract_type === "Hourly") ? "hidden" : "visible", 
                    status:confirmedStatus, 
                    showSkipConfirmation: false, 
                    currentLogEntry: res.data.serviceLog[0][0].key}))
        //     } else alert("confirmed status error: ", confirmedStatus)
        //     if (res.data.err.length > 0) {
        //         alert("prop details ln134 error: ", res.data.err[0])
        //     }
        // })
        // .catch(err => {
        //     console.log("prop details ln138 error:", err)
        //     alert(err)
        // })
    }

    const property = props.property
    return (
        property ? 
            <DetailsPanel property={property} showModal={showModal} onCloseClick={onCloseClick}>
                <Tabs defaultActiveKey='job'>
                    <Tab style={{padding: "1em", height:'75vh', overflow:'hide'}} eventKey='job' title='Job'>
                        <Row>
                            <Col>
                                <h3>{property?.cust_name}</h3>
                                <a href={`https://www.google.com/maps/place/${property?.address}%20${property?.city}%20${property?.state}%20${property?.zip}`} target="_blank">{property?.address}</a>
                                <p>phone: {property?.cust_phone}</p>
                            </Col>
                            <Col>
                                <h4 style={{textAlign:"right"}}>Surface: {property?.surface_type?.toUpperCase()}</h4>
                                    {
                                        workType.name === 'Sanding' && property.sand_contract === "Per Yard" ?
                                        <Form.Group>
                                            <Form.Label>Number of Yards</Form.Label>
                                            <Form.Control name="yards" type="numeric" value={yards} onChange={onTextChange}/>
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
                            <Form.Control name="noteField" as="textarea" rows="3" value={noteField} onChange={onTextChange}/>
                        </Form.Group>
                        </Card.Body>
                        {
                            property.contract_type === "Hourly" ? <TimeTracker yards={yards} workType={workType} onStatusChange={onStatusChange} isRunning={isRunning} setIsRunning={setIsRunning}/> : null 
                        }
                        <Card.Body className='buttonRowStyle'>
                            <Button variant="primary" size="lg" disabled={!property.routeName || isRunning} onClick={() => props.changeProperty(property, "prev")} >Prev</Button>
                            <Button variant="danger" size="lg" disabled={routePending || disabled || isRunning} onClick={toggleShowSkip}>Skip</Button>
                                <div style={{visibility: done_label, fontSize: "large"}}>                                    
                                    <Button variant='warning' size='lg' onClick={() => setState(prevState => ({...prevState, showUndoConfirmation: true}))} >Undo {newStatus}</Button>
                                </div>
                            <Button 
                                style={{visibility: (property.contract_type === 'Hourly') ? 'hidden' : 'visible'}} 
                                variant="success" 
                                size="lg"  
                                disabled={isRunning || routePending || disabled || (property.sand_contract === "Per Yard" && yards === 0 && workType.name === "Sanding")} 
                                onClick={() => onStatusChange('Done')}>
                                    Done
                            </Button>
                            <Button variant="primary" size="lg" disabled={!property.routeName || isRunning} onClick={() => props.changeProperty(property, "next")} >Next</Button>
                        </Card.Body>
                        <Card.Body>
                            <SkipDetails
                                show={showSkipConfirmation}
                                toggleShowSkip={toggleShowSkip}
                                onStatusChange={onStatusChange}
                                customer={property} 
                            />    
                            <Alert show={showUndoConfirmation} variant="danger">
                                <Alert.Heading>Undo {newStatus} and set as 'Waiting'?</Alert.Heading>
                                <Button size='lg' onClick={() => setState(prevState => ({...prevState, showUndoConfirmation: false}))}>Cancel</Button>
                                <Button size='lg' onClick={undoStatus}>Confirm</Button>
                            </Alert>                        
                        </Card.Body>
                    </Tab>
                    <Tab eventKey='logs' title='Logs'>
                        <CustLogs height="80vh"/>                  
                    </Tab>
                </Tabs>
            </DetailsPanel> : null
    )      
}

const DetailsPanel = (props) => {
    return (
        props.property?.contract_type === "Hourly" ? 
        <Modal style={{marginTop: '2em'}} show={props.showModal} onHide={props.onCloseClick} backdrop='static' size='lg'>
            <Modal.Header closeButton></Modal.Header>
            {props.children}
        </Modal> :
        <div className='rightside'> {props.children} </div>
    )
}

export default PropertyDetails