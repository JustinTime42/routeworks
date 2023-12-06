import React, {useState, useEffect} from 'react'
import {Tabs, Tab, Card, Button, Row, Col, Form, Alert, Modal} from 'react-bootstrap'
import CustLogs from '../customer_panels/CustLogs'
import SkipDetails from '../customer_panels/SkipDetails'
import TimeTracker from '../customer_panels/TimeTracker'

const DetailsView = ({
  onCloseClick, 
  getPriceModifiers, 
  getPriceMultiplier,
  changeActiveProperty,
  onStatusChange,
  onTextChange,
  toggleShowSkip,
  undoStatus,
  setIsRunning,

  newStatus,
  navigate,
  currentState,
  setState,
  property, 
  shouldShowModal, 
 }) => {
  const { noteField, disabled, yards, done_label, showSkipConfirmation, showUndoConfirmation, isRunning, modifier } = currentState

  useEffect(() => {
    console.log("props changed: ", property)
  }, [
    property, 
  ])
  useEffect(() => {
    console.log("props changed: ", shouldShowModal)
  }, [
    shouldShowModal, 
  ])
  useEffect(() => {
    console.log("props changed: ", onCloseClick)
  }, [
    onCloseClick, 
  ])
  useEffect(() => {
    console.log("props changed: ", getPriceModifiers)
  }, [
    getPriceModifiers, 
  ])
  useEffect(() => {
    console.log("props changed: ", getPriceMultiplier)
  }, [
    getPriceMultiplier, 
  ])
  useEffect(() => {
    console.log("props changed: ", navigate)
  }, [
    navigate, 
  ])
  useEffect(() => {
    console.log("props changed: ", changeActiveProperty)
  }, [
    changeActiveProperty, 
  ])
  useEffect(() => {
    console.log("props changed: ", onStatusChange)
  }, [
    onStatusChange, 
  ])
  useEffect(() => {
    console.log("props changed: ", onTextChange)
  }, [
    onTextChange, 
  ])
  useEffect(() => {
    console.log("props changed: ", toggleShowSkip)
  }, [
    toggleShowSkip, 
  ])
  useEffect(() => {
    console.log("props changed: ", undoStatus)
  }, [
    undoStatus, 
  ])
  useEffect(() => {
    console.log("props changed: ", newStatus)
  }, [
    newStatus, 
  ])
  useEffect(() => {
    console.log("props changed: ", setIsRunning)
  }, [
    setIsRunning, 
  ])
  useEffect(() => {
    console.log("props changed: ", currentState)
  }, [
    currentState, 
  ])
  useEffect(() => {
    console.log("props changed: ", setState)
  }, [
    setState, 
  ])







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

export default DetailsView