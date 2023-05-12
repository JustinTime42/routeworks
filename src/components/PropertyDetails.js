import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { Tabs, Tab, Card, Col, Row, Button, Form, Alert, Modal } from 'react-bootstrap'
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'
import { createItem, editItem, setActiveItem, showModal, hideModal} from "../actions"
import { REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE, ACTIVE_LOG_ENTRY, SET_ACTIVE_PROPERTY } from '../constants';
import CustLogs from './customer_panels/CustLogs'
import SkipDetails from './customer_panels/SkipDetails'
import TimeTracker from './customer_panels/TimeTracker'
import { changeActiveProperty } from './utils';

import '../styles/driver.css'

const initialState = {
    noteField: '',
    disabled: false,
    yards: '',
    done_label: "hidden",
    showSkipConfirmation: false,
    currentLogEntry: null,
    showUndoConfirmation: false,
    isRunning: false,
}

const PropertyDetails = (props) => {
    const [
        currentState,
        setState
    ] = useState(initialState)   
    const navigate = useNavigate()
    const { noteField, disabled, yards, done_label, newStatus, showSkipConfirmation, showUndoConfirmation, isRunning } = currentState    
    const customers = useSelector(state => state.requestAllAddresses.addresses)
    const driver = useSelector(state => state.setCurrentUser.currentUser.claims)
    const tractor = useSelector(state => state.setActiveTractor.activeTractor)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routes = useSelector(state => state.requestRoutes.routes)
    const workType = useSelector(state => state.setActiveWorkType.workType)
    const property = useSelector(state => state.setActiveProperty.activeProperty)
    const currentLogEntry = useSelector(state => state.setActiveLogEntry.entry)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const shouldShowModal = useSelector(state => state.whichModals.modals).includes("Hourly")

    const dispatch = useDispatch()
    const {custId, routeId} = useParams()

    const listener = (event) => {        
        const nope = 
            isRunning || 
            disabled || 
            (property.sand_contract === "Per Yard" && (!yards) && workType.name === "Sanding") || 
            (property.contract_type === 'Hourly') 
        if ((event.code === "KeyD") && event.altKey && event.ctrlKey && !nope) {
            onStatusChange('Done', '', null, null, false)
            navigate(`../${changeActiveProperty(property, "prev", activeRoute.customers)}`)
        }
    }

    useEffect(() => {      
        document.addEventListener("keydown", listener)
        return () => {
        document.removeEventListener("keydown", listener)
        }
    }, [currentState])

    useEffect(() => {   
        const newActiveCustomer = customers.find(i => i.id === custId)       
        if (newActiveCustomer === undefined) return 
        dispatch(setActiveItem(newActiveCustomer, customers, SET_ACTIVE_PROPERTY))
        if (newActiveCustomer.contract_type === "Hourly") { 
          dispatch(showModal("Hourly"))
            setTimeout(() => alert("Remember to log hours!"), 200) 
            setState(() => ({...initialState, disabled: true})) 
        } else {
            setState(initialState)
        }
    }, [custId])

    const onTextChange = (event) => {
        let {target: {name, value} } = event
        if (name === "yards") {
            if (value.charAt(value.length - 1) !== '.') {                
                value = Number(value)
            }
            if (value === 0) value = ''       
            if (isNaN(value)) {
                return
            }
        }
        setState({ ...currentState, [name]: value })
    } 

    const toggleShowSkip = () => setState(prevState => ({...prevState, showSkipConfirmation: !prevState.showSkipConfirmation}))

    const onCloseClick = () => {
        if(!isRunning) {
            dispatch(hideModal("Hourly"))
        } 
    } 

    const setIsRunning = (isRunning) => setState(prevState => ({...prevState, isRunning:isRunning}))
    
    const undoStatus = () => {
        deleteDoc(doc(db, `organizations/${organization}/service_logs`, currentLogEntry.id))
        .then(() => {
            setState(prevState => ({...prevState, showUndoConfirmation: false, done_label: "hidden", disabled: false}))
            dispatch(setActiveItem(null, [], ACTIVE_LOG_ENTRY))
        })
        .catch(err => alert(err))
        let newRouteCustomers = {...activeRoute.customers}
        newRouteCustomers[property.id].status = "Waiting"
        dispatch(editItem({...activeRoute, customers: newRouteCustomers}, customers, `organizations/${organization}/route`, SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
    }

    const onStatusChange = (newStatus, skipDetails='', startTime=null, endTime=null, disabled=true) => {
        setState(prevState => ({...prevState, disabled: disabled}))        
        const customerDetails = customers.find(i => i.id === property.id)
        let newRecordObject = {}
        newRecordObject.status = newStatus
        newRecordObject.price = property.snow_price
        let month = ('0' + (new Date().getMonth() + 1)).slice(-2) 
        let year = new Date().getFullYear().toString().substr(-2)
        // round down to the nearest minute. and then up to the nearest quarter hour
        let timeLogged = Math.ceil(Math.floor((endTime - startTime) / 60000) / 15) / 4
        
        newRecordObject.driverEarning = driver.percentage * .01 * property.value
        let yardString = ((workType.name === 'Sanding') && (property.sand_contract === "Per Yard")) ? ": " + yards + " yds" : ""
        if (property.contract_type === 'Hourly') {
            newRecordObject.driverEarning = timeLogged * driver.hourly
        }
        if (newStatus === "Skipped") {
            setIsRunning(false)
            newRecordObject.price = 0
        } else if (workType.name === 'Sanding') {               
            (property.sand_contract === "Per Yard") ? newRecordObject.price = property.price_per_yard * yards : newRecordObject.price = property.price_per_yard
        } else if (property.contract_type === 'Hourly') {
            newRecordObject.price = timeLogged * property[tractor.type]
        } else if (workType.name === 'Sweeping') {
            newRecordObject.price = property.sweep_price
        } else if ((property.contract_type === 'Seasonal' || property.contract_type === 'Monthly') && (workType.name === 'Snow Removal')) {            
            newRecordObject.price = 0  
        }
        newRecordObject.timestamp = new Date(Date.now())
        newRecordObject.contract_type = customerDetails.contract_type
        newRecordObject.cust_id = customerDetails.id
        newRecordObject.reference = customerDetails.service_address
        newRecordObject.service_address = customerDetails.service_address
        newRecordObject.cust_name = customerDetails.cust_name
        newRecordObject.cust_email = customerDetails.cust_email
        newRecordObject.cust_email2 = customerDetails.cust_email2
        newRecordObject.include_email2 = customerDetails.include_email2
        newRecordObject.value = customerDetails.value
        newRecordObject.driver = driver.name
        newRecordObject.notes = newRecordObject.status === 'Skipped' ? noteField + ' ' + skipDetails : noteField
        newRecordObject.vehicle = tractor.name
        newRecordObject.vehicle_type = tractor.type
        newRecordObject.work_type = workType.name
        newRecordObject.bill_address = customerDetails.bill_address
        newRecordObject.bill_city = customerDetails.bill_city
        newRecordObject.bill_state = customerDetails.bill_state
        newRecordObject.bill_zip = customerDetails.bill_zip
        if (yards) {newRecordObject.yards = (yards !== 0) ? yards : ""}
        if (startTime) {newRecordObject.startTime = startTime}
        if (endTime) {newRecordObject.endTime = endTime} 
        newRecordObject.description = newRecordObject.status === 'Skipped' ? '' : workType.name + yardString
        newRecordObject.invoice_number = `A${property.id.substring(0,5)}${year}${month}`
        if (property.price_per_yard) {newRecordObject.price_per_yard = property.price_per_yard}
        if (property[tractor.type]) {newRecordObject.hourly_rate = property[tractor.type]} 

        // editItem to make change status on current route
        if (activeRoute?.customers?.[property.id]) {
            const newDetails = {
                id: activeRoute.id, 
                [`customers.${property.id}.status`]: newStatus, 
                [`customers.${property.id}.priority`]: false 
            }    
            dispatch(editItem(
                newDetails, 
                routes, 
                `organizations/${organization}/route/`, 
                ))
        } else {
            alert('No change in status on route. If you are serving a customer without their route pulled up, this is expected behavior.')
        }
        let keysArray = Object.keys(newRecordObject)
        keysArray.forEach(key => {
            if (newRecordObject[key] === null || newRecordObject[key] === undefined) {delete newRecordObject[key]}
        })
        if (!((property.contract_type === 'Hourly') && (newStatus === "Done")) ) {
            dispatch(createItem(newRecordObject, null, `organizations/${organization}/service_logs`, ACTIVE_LOG_ENTRY, null))
        }
        

        const confirmedStatus = currentLogEntry.status
        setState(prevState => ({
            ...prevState, 
            done_label: (confirmedStatus === "Waiting" || property.contract_type === "Hourly") ? "hidden" : "visible", 
            showSkipConfirmation: false, 
        }))
    }


    return (
        <WithModal property = { property } shouldShowModal = { shouldShowModal } onCloseClick = { onCloseClick }>
            <Tabs defaultActiveKey='job'>
                <Tab style={{padding: "1em", height:'75vh', overflow:'hide'}} eventKey='job' title='Job'>
                    <Row>
                        <Col>
                            <h3>{property?.cust_name}</h3>
                            <a href={`https://www.google.com/maps/place/${property?.service_address}%20${property?.service_city}%20${property?.service_state}%20${property?.service_zip}`} target="_blank">{property?.service_address}</a>
                            <p>phone: {property?.cust_phone}</p>
                        </Col>
                        <Col>
                            <h4 style={{textAlign:"right"}}>Surface: {property?.surface_type?.toUpperCase()}</h4>
                            {
                            workType.name === 'Sanding' && property.sand_contract === "Per Yard" ?
                            <Form.Group>
                                <Form.Label>Number of Yards</Form.Label>
                                <Form.Control name="yards" type="number" step='any' value={yards || ''} onChange={onTextChange}/>
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
                        <Form.Control name="noteField" as="textarea" rows="3" value={noteField || ""} onChange={onTextChange}/>
                    </Form.Group>
                    </Card.Body>
                    {
                        property.contract_type === "Hourly" ? <TimeTracker sand_contract={property.sand_contract} yards={yards} workType={workType} onStatusChange={onStatusChange} isRunning={isRunning} setIsRunning={setIsRunning}/> : null 
                    }
                    <Card.Body className='buttonRowStyle'>
                        <Button 
                            variant="primary"
                            size="lg"
                            disabled={isRunning}
                            onClick={() => navigate(`../${changeActiveProperty(property, "prev", activeRoute.customers)}`)} 
                            >
                                Prev
                        </Button>
                        <Button variant="danger" size="lg" onClick={toggleShowSkip}>Skip</Button>
                            <div style={{visibility: done_label, fontSize: "large"}}>                                    
                                <Button variant='warning' size='lg' onClick={() => setState(prevState => ({...prevState, showUndoConfirmation: true}))} >Undo {newStatus}</Button>
                            </div>
                        <Button 
                            //style={{visibility: (property.contract_type === 'Hourly') ? 'hidden' : 'visible'}} 
                            variant="success" 
                            size="lg"  
                            disabled={isRunning || disabled || (property.sand_contract === "Per Yard" && !yards && workType.name === "Sanding")} 
                            autoFocus={true}                                
                            onClick={() => onStatusChange('Done')}>
                                Done
                        </Button>
                        <Button 
                            variant="primary"
                            size="lg"
                            disabled={isRunning} 
                            onClick={() => navigate(`../${changeActiveProperty(property, "next", activeRoute.customers)}`)}
                            >
                                Next
                        </Button>
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
                <Tab eventKey='logs' title='Logs' mountOnEnter={true} unmountOnExit={true}>
                    <CustLogs style={{padding: "1em", height:'75vh', overflow:'hide'}}/>                  
                </Tab>
            </Tabs>
        </WithModal>
    )      
}

const WithModal = (props) => {
    const { property, shouldShowModal, onCloseClick, children } = props    
    return (
        property.contract_type === "Hourly" ? 
            <Modal style={{marginTop: '2em'}} show={shouldShowModal} onHide={onCloseClick} backdrop='static' size='lg'>
            <Modal.Header closeButton></Modal.Header>            
            {property.id ? children : null}
        </Modal> :
        <div className='rightside'> 
            {property.id ?  children : null }
        </div>
    )

}

export default PropertyDetails