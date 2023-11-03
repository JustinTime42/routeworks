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
// import { changeActiveProperty } from './utils';

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
    modifier: {},
}

const PropertyDetails = () => {
    const [
        currentState,
        setState
    ] = useState(initialState)   
    const [changeActiveProperty] = useOutletContext()
    const navigate = useNavigate()
    const { modifier, noteField, disabled, yards, done_label, newStatus, showSkipConfirmation, showUndoConfirmation, isRunning } = currentState    
    const serviceLocations = useSelector(state => state.requestAllAddresses.addresses)
    const customers = useSelector(state => state.getAllCustomers.customers)
    const driver = useSelector(state => state.setCurrentUser.currentUser.claims)
    const tractor = useSelector(state => state.setActiveTractor.activeTractor)
    const vehicleType = useSelector(state => state.setActiveVehicleType.activeVehicleType)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routes = useSelector(state => state.requestRoutes.routes)
    const workType = useSelector(state => state.setActiveWorkType.workType)
    const property = useSelector(state => state.setActiveProperty.activeProperty)
    const currentLogEntry = useSelector(state => state.setActiveLogEntry.entry)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const shouldShowModal = useSelector(state => state.whichModals.modals).includes("Per Hour")


    const dispatch = useDispatch()
    const {custId, routeId} = useParams()

    const getPriceMultiplier = () => {
        return property?.pricing?.workTypes?.[workType.id]?.pricingMultiple
    }

    const listener = (event) => {        
        const nope = 
            isRunning || 
            disabled || 
            (getPriceMultiplier() === "Per Yard" && !yards) || 
            (getPriceMultiplier() === 'Per Hour') 
        if ((event.code === "KeyD") && event.altKey && event.ctrlKey && !nope) {
            onStatusChange('Done', '', null, null, false)
            navigate(`../${changeActiveProperty(property, "prev")}`)
        }
    }

    useEffect(() => {     
        console.log(currentState) 
        document.addEventListener("keydown", listener)
        return () => {
        document.removeEventListener("keydown", listener)
        }
    }, [currentState])

    useEffect(() => {   
        const newActiveCustomer = serviceLocations.find(i => i.id === custId)       
        if (newActiveCustomer === undefined) return 
        dispatch(setActiveItem(newActiveCustomer, serviceLocations, SET_ACTIVE_PROPERTY))
    }, [custId])

    useEffect(() => {
        if(property?.id) {
            let newRouteCustomers = {...activeRoute.customers}
            // if (getUnitPrice() === undefined) {
            //     alert(`This customer does not have pricing information for this task. Please select a different work type or enter the appropriate information.`)
            //     return
            // }            
            if (newRouteCustomers[property.id] && (newRouteCustomers[property.id].status === "Waiting")) {
                newRouteCustomers[property.id].status = "In Progress"
                dispatch(editItem({
                    ...activeRoute, 
                    customers: newRouteCustomers}, 
                    serviceLocations, `organizations/${organization}/route`, 
                    SET_ACTIVE_ROUTE, 
                    REQUEST_ROUTES_SUCCESS))
            }
            if (getPricingMultiple() === "Per Hour") { 
                dispatch(showModal("Per Hour"))
                  setTimeout(() => alert("Remember to log hours!"), 200) 
                  setState(() => ({...initialState, disabled: true})) 
              } else {
                  setState(initialState)
              }
        }
    }, [property.id])

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
            dispatch(hideModal("Per Hour"))
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
        dispatch(editItem({...activeRoute, customers: newRouteCustomers}, serviceLocations, `organizations/${organization}/route`, SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
    }

    const getWorkTypeObject = () => {
        return property.pricing?.workTypes?.[workType.id]
    }

    const getVehicleType = () => {
        return tractor.type
    }

    const getPriceBasis = () => {
        const workTypeObject = getWorkTypeObject()
        return workTypeObject?.pricingBasis === "Work Type" ? workType.id : tractor.type // eg: "Snow Removal" : "Road Grader"
    }

    const getUnitPrice = () => {
        const workTypeObject = getWorkTypeObject()
        const basis = getPriceBasis()
        console.log(basis)
        return workTypeObject?.prices?.[basis]
    }

    const getPricingMultiple = () => {
        const workTypeObject = getWorkTypeObject()
        console.log(workTypeObject?.pricingMultiple)
        return workTypeObject?.pricingMultiple
    }

    const getPriceModifiers = () => {
        const workTypeObject = getWorkTypeObject()
        return workTypeObject?.modifiers || []
    }

    const handleModifier = (price) => {
        if (modifier) {
            switch(modifier.operator) {
                case "+" : return price + modifier.value
                case "-" : return price - modifier.value
                case "*" : return price * modifier.value
                case "/" : return price / modifier.value
                default: return price
            }
        } else {
            return price
        }
    }

    const getPrice = (timeLogged=null) => {
        let multiplier 
        switch (getPricingMultiple()) {
            case "Per Hour": multiplier = timeLogged
                break
            case "Per Visit": multiplier = 1
                break
            case "Per Yard": multiplier = yards
                break
            case "Subscription": multiplier = 0
                break
            default: multiplier = 1
        }
        const unitPrice = getUnitPrice()
        const price = handleModifier(unitPrice * multiplier)
        return {total: price, unitPrice: unitPrice, multiplier: multiplier}
    }

    const onStatusChange = (newStatus, skipDetails='', startTime=null, endTime=null, disabled=true) => {
        
        setState(prevState => ({...prevState, disabled: disabled}))        
        const customerDetails = serviceLocations.find(i => i.id === property.id)
        let newRecordObject = {}
        newRecordObject.status = newStatus

        // newRecordObject.price = property.snow_price
        newRecordObject.stripeID = customers.find(i => i.id === property.cust_id).stripeID
        let month = ('0' + (new Date().getMonth() + 1)).slice(-2) 
        let year = new Date().getFullYear().toString().substr(-2)
        // round down to the nearest minute. and then up to the nearest quarter hour
        let timeLogged = Math.ceil(Math.floor((endTime - startTime) / 60000) / 15) / 4
        
        newRecordObject.driverEarning = driver.percentage * .01 * property.value || 0
        
        let amountString = ""
        if (newStatus === "Skipped") {
            setIsRunning(false)
            newRecordObject.price = 0
        } else {
            const priceObject = getPrice(timeLogged)
            newRecordObject.price = !isNaN(priceObject.total) ? priceObject.total : 0
            newRecordObject.unit_price = priceObject.unitPrice            
            if (getPriceMultiplier() === "Per Hour") {
                newRecordObject.quantity = timeLogged
                amountString = ": " + timeLogged + " hrs"
            } else if (getPriceMultiplier() === "Per Yard") {
                amountString = ": " + yards + " yds"
                newRecordObject.quantity = yards
            } else {
                newRecordObject.quantity = 1
            }
            if (modifier) {
                amountString += ` ${modifier.name || ""}`
            }
            newRecordObject.multiplier = priceObject.multiplier
        }
        // else if (workType.name === 'Sanding') {               
        //     (property.sand_contract === "Per Yard") ? newRecordObject.price = property.price_per_yard * yards : newRecordObject.price = property.price_per_yard
        // } else if (property.contract_type === 'Per Hour') {
        //     newRecordObject.price = timeLogged * property[tractor.type]
        // } else if (workType.name === 'Sweeping') {
        //     newRecordObject.price = property.sweep_price
        // } else if ((property.contract_type === 'Seasonal' || property.contract_type === 'Monthly') && (workType.name === 'Snow Removal')) {            
        //     newRecordObject.price = 0  
        // }
        newRecordObject.timestamp = new Date(Date.now())
        newRecordObject.contract_type = getPriceMultiplier()
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
        newRecordObject.vehicle_type = vehicleType.name
        newRecordObject.work_type = workType.name
        newRecordObject.bill_address = customerDetails.bill_address
        newRecordObject.bill_city = customerDetails.bill_city
        newRecordObject.bill_state = customerDetails.bill_state
        newRecordObject.bill_zip = customerDetails.bill_zip
        if (yards) {newRecordObject.yards = (yards !== 0) ? yards : ""}
        if (startTime) {newRecordObject.startTime = startTime}
        if (endTime) {newRecordObject.endTime = endTime} 
        newRecordObject.description = newRecordObject.status === 'Skipped' ? '' : workType.name + amountString
        //newRecordObject.invoice_number = `A${property.id.substring(0,5)}${year}${month}`
        // if (property.price_per_yard) {newRecordObject.price_per_yard = property.price_per_yard}
       // if (property[tractor.type]) {newRecordObject.hourly_rate = property[tractor.type]}
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
        if (!((getPriceMultiplier() === 'Per Hour') && (newStatus === "Done")) ) {
            dispatch(createItem(newRecordObject, null, `organizations/${organization}/service_logs`, ACTIVE_LOG_ENTRY, null))
        }
        

        const confirmedStatus = currentLogEntry.status
        setState(prevState => ({
            ...prevState, 
            done_label: (confirmedStatus === "Waiting" || getPriceMultiplier() === "Per Hour") ? "hidden" : "visible", 
            showSkipConfirmation: false, 
        }))
        console.log(getPrice(timeLogged))
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
                            getPriceMultiplier() === "Per Yard" ?
                            (<Form.Group>
                                <Form.Label>Number of Yards</Form.Label>
                                <Form.Control name="yards" type="number" step='any' value={yards || ''} onChange={onTextChange}/>
                            </Form.Group> ): null
                            }
                            {getPriceModifiers().length > 0 && (
                                <Card style={{width: "12rem"}}>
                                    <Card.Header>Optional Addons</Card.Header>
                                    <Form.Check
                                        type="radio"
                                        label="N/A"
                                        name="modifier"
                                        id="None"                                        
                                        value={{}}
                                        defaultChecked 
                                        onChange={() => setState(prevState => ({...prevState, modifier: {}}))}
                                    />
                                    {getPriceModifiers().map((modifier, i) => {
                                        return (
                                            <Form.Check
                                                key={i}
                                                type="radio"
                                                label={modifier.name}
                                                name="modifier"
                                                id={modifier.name}
                                                value={modifier}
                                                onChange={() => setState(prevState => ({...prevState, modifier: modifier}))}
                                            />
                                        )
                                    })}
                                </Card>
                            )}   
                            
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
                        getPriceMultiplier() === "Per Hour" ? (
                            <TimeTracker 
                                needsYards={getPriceMultiplier() === "Per Yard" && !yards}
                                onStatusChange={onStatusChange} 
                                isRunning={isRunning} 
                                setIsRunning={setIsRunning}
                            />
                            )
                        : null 
                    }
                    <Card.Body className='buttonRowStyle'>
                        <Button 
                            variant="primary"
                            size="lg"
                            disabled={isRunning}
                            onClick={() => navigate(`../${changeActiveProperty(property, "prev")}`)} 
                            >
                                Prev
                        </Button>
                        <Button variant="danger" size="lg" onClick={toggleShowSkip}>Skip</Button>
                            <div style={{visibility: done_label, fontSize: "large"}}>                                    
                                <Button variant='warning' size='lg' onClick={() => setState(prevState => ({...prevState, showUndoConfirmation: true}))} >Undo {newStatus}</Button>
                            </div>
                        <Button 
                            //style={{visibility: (property.contract_type === 'Per Hour') ? 'hidden' : 'visible'}} 
                            variant="success" 
                            size="lg"  
                            disabled={isRunning || disabled || (getPriceMultiplier() === "Per Yard" && !yards)} 
                            autoFocus={true}                                
                            onClick={() => onStatusChange('Done')}>
                                Done
                        </Button>
                        <Button 
                            variant="primary"
                            size="lg"
                            disabled={isRunning} 
                            onClick={() => navigate(`../${changeActiveProperty(property, "next")}`)}
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
                    <CustLogs style={{padding: "1em", height:'75vh', overflow:'hide'}} admin={false}/>                  
                </Tab>
            </Tabs>
        </WithModal>
    )      
}

const WithModal = (props) => {
    const { property, shouldShowModal, onCloseClick, children } = props    
    return (
        shouldShowModal && property.id ? 
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