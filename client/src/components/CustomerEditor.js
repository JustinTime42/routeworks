import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { requestAllAddresses, getRouteProperties, setActiveProperty } from '../actions'
import axios from "axios"
import CustLogs from './customer_panels/CustLogs'
import '../styles/driver.css'
import { serviceLevels } from "../globals.js"
const contractTypes = ["Per Occurrence", "Monthly", "Seasonal", "5030", "Will Call", "Asphalt", "Hourly"]


const sandContractTypes = ["Per Visit", "Per Yard"]
const editorSize = {height:"90vh"}

const CustomerDetails = props => {
    const reduxProperty = useSelector(state => state.setActiveProperty.activeProperty)
    //const [activeProperty, setActiveProperty] = useState(reduxProperty)
    const routeData = useSelector(state => state.getRouteData.routeData)
    const dispatch = useDispatch()
    const [api, setApi] = useState([reduxProperty ? "editproperty" : "newproperty"])
    const [deleteAlert, setDeleteAlert] = useState(false)
    const [allTags, setAllTags] = useState([])
    const [newTagName, setNewTagName] = useState('')
    const [sameAddress, setSameAddress] = useState(false)

    useEffect(() => { 
        //setActiveProperty(reduxProperty)
        setApi(reduxProperty ? "editproperty" : "newproperty")
        setSameAddress(false)
        getTags()
    }, [reduxProperty])

    const getTags = () => {
        fetch(`${process.env.REACT_APP_API_URL}/alltags`)
        .then(res => res.json())
        .then(tags => setAllTags(tags)) 
        .catch(err => console.log(err))
    }

    const tagChange = (event) => {
        console.log(event)
        let {target: {name, value} } = event
        let tagsArray = reduxProperty.tags ? reduxProperty.tags?.split(',') : []
        if (tagsArray.includes(name)) {
            tagsArray.splice(tagsArray.indexOf(name), 1)
        } else {
            tagsArray.push(name)
        }
        let tags = tagsArray.join()
        dispatch(setActiveProperty({...reduxProperty, tags: tags})) 
    }

    const saveNewTag = () => {     
        axios.post(`${process.env.REACT_APP_API_URL}/newtag`, { tag_name: newTagName})
        .then(tag => setAllTags([...allTags, tag.data])) 
        .catch(err => console.log(err))
    }

    // const deleteTag = (tag) => {
    //     axios.post(`${process.env.REACT_APP_API_URL}/deltag`, { tag_name: tag})
    //     .then(tag => setAllTags([...allTags.splice(allTags.indexOf(tag.data[0].tag_name), 1)])) 
    //     .catch(err => console.log(err))
    // }
    
    const onChange = (event) => {
        let { target: { name, value } } = event
        console.log(name)
        let numberValues = ['price', 'value', 'price_per_yard', 'sweep_price']
        if (numberValues.includes(name)){
            value = Number(value)
        }
        if (value === "on") {
            dispatch(setActiveProperty({...reduxProperty, [name]: !reduxProperty[name]}))          
        } else if (name === 'newTagName') {
            setNewTagName(value)            
        }
        else {  
            dispatch(setActiveProperty({...reduxProperty, [name]: value}))
        }
        console.log(reduxProperty)
    }

    const clickSameAddress = () => {
        dispatch(setActiveProperty(
            {
                ...reduxProperty, 
                bill_address: reduxProperty.address,
                bill_city: reduxProperty.city,
                bill_state: reduxProperty.state,
                bill_zip: reduxProperty.zip,
            }
        ))
        setSameAddress(!sameAddress)
    }

    return (        
        <Modal className="scrollable" style={editorSize} show={props.show} onHide={props.close} size='lg'>
            <Modal.Header>Customer Editor</Modal.Header>
            <Modal.Body>
                <Tabs defaultActiveKey='contact'>
                    <Tab eventKey='contact' title='Contact Info'>
                        <Form>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Name</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="cust_name" type="text" value={reduxProperty?.cust_name || ''} onChange={onChange}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>First Name</Form.Label>
                                <Col sm={4}>
                                    <Form.Control name="cust_fname" type="text" value={reduxProperty?.cust_fname || ''} onChange={onChange}/>
                                </Col>
                                <Form.Label column sm={2}>Last Name</Form.Label>
                                <Col sm={4}>
                                    <Form.Control name="cust_lname" type="text" value={reduxProperty?.cust_lname || ''} onChange={onChange}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Phone</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="cust_phone" type="text" value={reduxProperty?.cust_phone || ''} onChange={onChange}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Email</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="cust_email" type="text" value={reduxProperty?.cust_email || ''} onChange={onChange}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Email 2</Form.Label>
                                <Col sm={6}>
                                    <Form.Control name="cust_email2" type="text" value={reduxProperty?.cust_email2 || ''} onChange={onChange}/>
                                </Col>
                                <Col sm={4}>
                                    <Form.Check
                                        name="include_email2"
                                        type="checkbox"
                                        label="Include Email2?"
                                        checked = {!!reduxProperty?.include_email2}
                                        onChange={onChange}
                                    /> 
                                </Col>
                            </Form.Group>                        
                        <Row>
                    <Col>
                        <Form.Label>Job Location</Form.Label>                  
                        <Form.Group as={Row}>
                            <Form.Label>Address</Form.Label>
                            <Col>
                                <Form.Control name="address" type="text" value={reduxProperty?.address || ''} onChange={onChange}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label>City</Form.Label>
                            <Col>
                                <Form.Control name="city" type="text" value={reduxProperty?.city || ''} onChange={onChange}/>
                            </Col>
                        </Form.Group>
                        <Row>
                        <Col>
                        <Form.Group>                                                                                                    
                            <Form.Label>State</Form.Label>   
                            <Form.Control name="state" type="text" value={reduxProperty?.state || ''} onChange={onChange}/>
                        </Form.Group>
                        </Col>
                        <Col>
                        <Form.Group>
                            <Form.Label>Zip</Form.Label>                              
                            <Form.Control name="zip" type="text" value={reduxProperty?.zip || ''} onChange={onChange}/> 
                        </Form.Group>
                        </Col>   
                        </Row>                                
                    </Col>
                    <Col>
                        <Row>
                        <Form.Label>Billing Address</Form.Label> 
                        <Form.Check
                            style={{marginLeft:"2em"}}
                            name="sameAddress"
                            type="checkbox"
                            label="Same as physical?"
                            checked = {!!sameAddress}
                            onChange={clickSameAddress}
                        /> 
                        </Row>                                                 
                        <Form.Group as={Row}>
                            <Form.Label>Address</Form.Label>
                            <Col>
                                <Form.Control name="bill_address" type="text" value={reduxProperty?.bill_address || ''} onChange={onChange}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label>City</Form.Label>
                            <Col>
                                <Form.Control name="bill_city" type="text" value={reduxProperty?.bill_city || ''} onChange={onChange}/>
                            </Col>
                        </Form.Group>
                        <Row>                                
                        <Col>
                        <Form.Group>                                                                                                    
                            <Form.Label>State</Form.Label>   
                            <Form.Control name="bill_state" type="text" value={reduxProperty?.bill_state || ''} onChange={onChange}/>
                        </Form.Group>
                        </Col>
                        <Col>
                        <Form.Group>
                            <Form.Label>Zip</Form.Label>                              
                            <Form.Control name="bill_zip" type="text" value={reduxProperty?.bill_zip || ''} onChange={onChange}/> 
                        </Form.Group>
                        </Col>   
                        </Row>
                    </Col>
                    </Row>
                    
                    </Form>
                    </Tab>
                    <Tab eventKey='job' title='Job Info'>
                        <Form>
                        <Form.Row> 
                            {/* contract_type === hourly ? //pricing fields : <Col> below */}
                        <Col> 
                        <Form.Label size='sm'>Prices</Form.Label>
                            <Form.Group>
                                <Form.Row>  
                                    <Col xs={8}>
                                        <Form.Label size='sm'>Snow Price</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control size='sm' name="price" type="number" value={reduxProperty?.price || ''} onChange={onChange}/>
                                    </Col>
                                </Form.Row>                                    
                            </Form.Group>
                            <Form.Group>
                                <Form.Row>  
                                    <Col xs={8}>
                                        <Form.Label size='sm'>Seasonal Price</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control size='sm' name="season_price" type="number" value={reduxProperty?.season_price || ''} onChange={onChange}/>
                                    </Col>
                                </Form.Row>                                    
                            </Form.Group>
                            <Form.Group>
                            <Form.Row>
                                <Col xs={8}>
                                    <Form.Label size='sm'>Sweeping Price</Form.Label>
                                </Col>                                    
                                <Col>
                                    <Form.Control size='sm' name="sweep_price" type="number" value={reduxProperty?.sweep_price || ''} onChange={onChange}/>
                                </Col>
                            </Form.Row>
                            </Form.Group>
                            <Form.Group>
                            <Form.Row>
                                <Col xs={8}>
                                    <Form.Label size='sm'>Sanding Price Per Yard</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control size='sm' name="price_per_yard" type="number" value={reduxProperty?.price_per_yard || ''} onChange={onChange}/>
                                </Col>
                            </Form.Row>
                            </Form.Group>
                            <Form.Group>
                            <Form.Row>
                                <Col xs={8}>
                                <Form.Label size='sm'>Value</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control size='sm' name="value" type="number" value={reduxProperty?.value || ''} onChange={onChange}/>
                                </Col>
                            </Form.Row>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label size='sm'>Surface Type</Form.Label>
                                    <Form.Control size='sm' name="surface_type" as="select" value={reduxProperty?.surface_type || ''} onChange={onChange}>
                                        <option value="select">Select</option>
                                        <option value="paved">Paved</option>
                                        <option value="gravel">Gravel</option>
                                        <option value="partial">Partial</option>
                                    </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Contract Type</Form.Label>
                                    <Form.Control name="contract_type" as="select" value={reduxProperty?.contract_type || ''} onChange={onChange}>
                                        {
                                            contractTypes.map(type => <option key={type} value={type}>{type}</option>)
                                        }
                                    </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Service Level</Form.Label>
                                    <Form.Control name="service_level" as="select" value={reduxProperty?.service_level || ''} onChange={onChange}>
                                        {
                                            serviceLevels.map((type, i) => <option key={type} value={i}>{type}</option>)
                                        }
                                    </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Sanding Contract</Form.Label>
                                    <Form.Control name="sand_contract" as="select" value={reduxProperty?.sand_contract || ''} onChange={onChange}>
                                        {
                                            sandContractTypes.map(type => <option key={type} value={type}>{type}</option>)
                                        }
                                    </Form.Control>
                            </Form.Group>
                            <Form.Check
                                name="is_new"
                                type="checkbox"
                                label="New?"
                                checked = {!!reduxProperty?.is_new}
                                onChange={onChange}
                            />   
                            <Form.Check 
                                name="inactive"
                                type="checkbox"
                                label="Inactive?"
                                checked = {!!reduxProperty?.inactive}
                                onChange={onChange}
                            />
                            <Form.Check
                                name="temp"
                                type="checkbox"
                                label="Temporary?"
                                checked = {!!reduxProperty?.temp}
                                onChange={onChange}
                            />
                            <Form.Check
                                name="priority"
                                type="checkbox"
                                label="Priority?"
                                checked = {!!reduxProperty?.priority}
                                onChange={onChange}
                            />
                        </Col>
                        <Col>
                            <Form.Label>Tags</Form.Label> 
                            <Form.Row style={{marginBottom: '1em'}}>
                                <Col>
                                    <Button size='sm' variant='primary' onClick={saveNewTag}>add tag</Button>
                                </Col>
                                <Col>
                                    <Form.Control name="newTagName" type="text" placeholder={newTagName} onChange={onChange}/>
                                </Col>
                            </Form.Row>
                            {                                    
                                allTags.map((tag, i) => {
                                    return(       
                                        <Form.Row key={i}>
                                            <Col xs={7}>
                                                <Form.Check                                                          
                                                    name={tag}
                                                    type="checkbox"
                                                    label={tag}
                                                    checked = {reduxProperty?.tags?.includes(tag) || false}
                                                    onChange={tagChange}
                                                />  
                                            </Col>
                                        </Form.Row>                                       
                                    )                               
                                })                                    
                            }
                            <Form.Row>
                                <Form.Label>Routes Assigned:</Form.Label>
                            {
                                routeData.map((entry, i) => {                                        
                                    if (entry.property_key === reduxProperty?.key) {
                                        return (
                                            <Form.Label key={i}>{entry.route_name}, </Form.Label>
                                        )
                                    } else return null
                                })
                            }
                            </Form.Row>  
                        </Col>
                        </Form.Row>
                        <Form.Group>
                            <Form.Label>Notes</Form.Label>
                                <Form.Control name="notes" as="textarea" rows="3" value={reduxProperty?.notes || ''} onChange={onChange}/>
                        </Form.Group>
                    </Form> 
                    </Tab>
                    {
                        reduxProperty?.key ?
                        <Tab eventKey='logs' title='Service Logs'>
                            <CustLogs height="50vh"/>
                        </Tab> : null
                    }
                </Tabs>
                
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={() => setDeleteAlert(!deleteAlert)}>{deleteAlert ? "Cancel" : "DELETE PROPERTY"}</Button>
                <Button variant="primary" onClick={() => props.onSave(reduxProperty)}>Save Customer</Button>
                <Button variant="secondary" onClick={props.close}>Close</Button>
            </Modal.Footer>
            <Alert show={deleteAlert} variant="danger">
                <Alert.Heading>Delete Property?</Alert.Heading>
                <p>
                {reduxProperty?.address}
                </p>
                <hr />
                <div className="d-flex justify-content-end">
                <Button onClick={props.onDelete} variant="outline-success">
                    Permanently Delete This Property
                </Button>
                </div>
            </Alert>
        </Modal>
    )
    
}

export default CustomerDetails