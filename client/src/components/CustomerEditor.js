import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { requestAllAddresses, getRouteProperties, setActiveProperty } from '../actions'
import axios from "axios"
import CustLogs from './customer_panels/CustLogs'
import '../styles/driver.css'

const contractTypes = ["Per Occurrence", "Monthly", "Seasonal", "5030", "Will Call", "Asphalt"]
const sandContractTypes = ["Per Visit", "Per Yard"]
const editorSize = {height:"90vh"}

const CustomerDetails = props => {
    const reduxProperty = useSelector(state => state.setActiveProperty.activeProperty)
    const [activeProperty, setActiveProperty] = useState(reduxProperty)
    const routeData = useSelector(state => state.getRouteData.routeData)
    const dispatch = useDispatch()
    const [api, setApi] = useState([props.activeProperty ? "editproperty" : "newproperty"])
    const [deleteAlert, setDeleteAlert] = useState(false)
    const [allTags, setAllTags] = useState([])
    const [newTagName, setNewTagName] = useState('')
    const [sameAddress, setSameAddress] = useState(false)

    useEffect(() => { 
        setActiveProperty(reduxProperty)
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
        let tagsArray = activeProperty.tags ? activeProperty.tags?.split(',') : []
        if (tagsArray.includes(name)) {
            tagsArray.splice(tagsArray.indexOf(name), 1)
        } else {
            tagsArray.push(name)
        }
        let tags = tagsArray.join()
        setActiveProperty({...activeProperty, tags: tags}) 
    }

    const saveNewTag = () => {     
        axios.post(`${process.env.REACT_APP_API_URL}/newtag`, { tag_name: newTagName})
        .then(tag => setAllTags([...allTags, tag.data])) 
        .catch(err => console.log(err))
    }

    const deleteTag = (tag) => {
        axios.post(`${process.env.REACT_APP_API_URL}/deltag`, { tag_name: tag})
        .then(tag => setAllTags([...allTags.splice(allTags.indexOf(tag.data[0].tag_name), 1)])) 
        .catch(err => console.log(err))
    }
    
    const onChange = (event) => {
        let { target: { name, value } } = event
        console.log(name)
        let numberValues = ['price', 'value', 'price_per_yard', 'sweep_price']
        if (numberValues.includes(name)){
            value = Number(value)
        }
        if (value === "on") {
            setActiveProperty({...activeProperty, [name]: !activeProperty[name]})          
        } else if (name === 'newTagName') {
            setNewTagName(value)            
        }
        else {  
            setActiveProperty({...activeProperty, [name]: value})
        }
        console.log(activeProperty)
    }

    const clickSameAddress = () => {
        setActiveProperty(
            {
                ...activeProperty, 
                bill_address: activeProperty.address,
                bill_city: activeProperty.city,
                bill_state: activeProperty.state,
                bill_zip: activeProperty.zip,
            }
        )
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
                                    <Form.Control name="cust_name" type="text" value={activeProperty?.cust_name || ''} onChange={onChange}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>First Name</Form.Label>
                                <Col sm={4}>
                                    <Form.Control name="cust_fname" type="text" value={activeProperty?.cust_fname || ''} onChange={onChange}/>
                                </Col>
                                <Form.Label column sm={2}>Last Name</Form.Label>
                                <Col sm={4}>
                                    <Form.Control name="cust_lname" type="text" value={activeProperty?.cust_lname || ''} onChange={onChange}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Phone</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="cust_phone" type="text" value={activeProperty?.cust_phone || ''} onChange={onChange}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Email</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="cust_email" type="text" value={activeProperty?.cust_email || ''} onChange={onChange}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Email 2</Form.Label>
                                <Col sm={6}>
                                    <Form.Control name="cust_email2" type="text" value={activeProperty?.cust_email2 || ''} onChange={onChange}/>
                                </Col>
                                <Col sm={4}>
                                    <Form.Check
                                        name="include_email2"
                                        type="checkbox"
                                        label="Include Email2?"
                                        checked = {!!activeProperty?.include_email2}
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
                                <Form.Control name="address" type="text" value={activeProperty?.address || ''} onChange={onChange}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label>City</Form.Label>
                            <Col>
                                <Form.Control name="city" type="text" value={activeProperty?.city || ''} onChange={onChange}/>
                            </Col>
                        </Form.Group>
                        <Row>
                        <Col>
                        <Form.Group>                                                                                                    
                            <Form.Label>State</Form.Label>   
                            <Form.Control name="state" type="text" value={activeProperty?.state || ''} onChange={onChange}/>
                        </Form.Group>
                        </Col>
                        <Col>
                        <Form.Group>
                            <Form.Label>Zip</Form.Label>                              
                            <Form.Control name="zip" type="text" value={activeProperty?.zip || ''} onChange={onChange}/> 
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
                                <Form.Control name="bill_address" type="text" value={activeProperty?.bill_address || ''} onChange={onChange}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label>City</Form.Label>
                            <Col>
                                <Form.Control name="bill_city" type="text" value={activeProperty?.bill_city || ''} onChange={onChange}/>
                            </Col>
                        </Form.Group>
                        <Row>                                
                        <Col>
                        <Form.Group>                                                                                                    
                            <Form.Label>State</Form.Label>   
                            <Form.Control name="bill_state" type="text" value={activeProperty?.bill_state || ''} onChange={onChange}/>
                        </Form.Group>
                        </Col>
                        <Col>
                        <Form.Group>
                            <Form.Label>Zip</Form.Label>                              
                            <Form.Control name="bill_zip" type="text" value={activeProperty?.bill_zip || ''} onChange={onChange}/> 
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
                        <Col> 
                        <Form.Label size='sm'>Prices</Form.Label>
                            <Form.Group>
                                <Form.Row>  
                                    <Col xs={8}>
                                        <Form.Label size='sm'>Price</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control size='sm' name="price" type="number" value={activeProperty?.price || ''} onChange={onChange}/>
                                    </Col>
                                </Form.Row>                                    
                            </Form.Group>
                            <Form.Group>
                                <Form.Row>  
                                    <Col xs={8}>
                                        <Form.Label size='sm'>Seasonal Price</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control size='sm' name="season_price" type="number" value={activeProperty?.season_price || ''} onChange={onChange}/>
                                    </Col>
                                </Form.Row>                                    
                            </Form.Group>
                            <Form.Group>
                            <Form.Row>
                                <Col xs={8}>
                                    <Form.Label size='sm'>Sweeping Price</Form.Label>
                                </Col>                                    
                                <Col>
                                    <Form.Control size='sm' name="sweep_price" type="number" value={activeProperty?.sweep_price || ''} onChange={onChange}/>
                                </Col>
                            </Form.Row>
                            </Form.Group>
                            <Form.Group>
                            <Form.Row>
                                <Col xs={8}>
                                    <Form.Label size='sm'>Sanding Price Per Yard</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control size='sm' name="price_per_yard" type="number" value={activeProperty?.price_per_yard || ''} onChange={onChange}/>
                                </Col>
                            </Form.Row>
                            </Form.Group>
                            <Form.Group>
                            <Form.Row>
                                <Col xs={8}>
                                <Form.Label size='sm'>Value</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control size='sm' name="value" type="number" value={activeProperty?.value || ''} onChange={onChange}/>
                                </Col>
                            </Form.Row>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label size='sm'>Surface Type</Form.Label>
                                    <Form.Control size='sm' name="surface_type" as="select" value={activeProperty?.surface_type || ''} onChange={onChange}>
                                        <option value="select">Select</option>
                                        <option value="paved">Paved</option>
                                        <option value="gravel">Gravel</option>
                                        <option value="partial">Partial</option>
                                    </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Contract Type</Form.Label>
                                    <Form.Control name="contract_type" as="select" value={activeProperty?.contract_type || ''} onChange={onChange}>
                                        {
                                            contractTypes.map(type => <option key={type} value={type}>{type}</option>)
                                        }
                                    </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Sanding Contract</Form.Label>
                                    <Form.Control name="sand_contract" as="select" value={activeProperty?.sand_contract || ''} onChange={onChange}>
                                        {
                                            sandContractTypes.map(type => <option key={type} value={type}>{type}</option>)
                                        }
                                    </Form.Control>
                            </Form.Group>
                            <Form.Check
                                name="is_new"
                                type="checkbox"
                                label="New?"
                                checked = {!!activeProperty?.is_new}
                                onChange={onChange}
                            />   
                            <Form.Check 
                                name="inactive"
                                type="checkbox"
                                label="Inactive?"
                                checked = {!!activeProperty?.inactive}
                                onChange={onChange}
                            />
                            <Form.Check
                                name="temp"
                                type="checkbox"
                                label="Temporary?"
                                checked = {!!activeProperty?.temp}
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
                                                    checked = {activeProperty?.tags?.includes(tag) || false}
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
                                    if (entry.property_key === activeProperty?.key) {
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
                                <Form.Control name="notes" as="textarea" rows="3" value={activeProperty?.notes || ''} onChange={onChange}/>
                        </Form.Group>
                    </Form> 
                    </Tab>
                    {
                        activeProperty?.key ?
                        <Tab eventKey='logs' title='Service Logs'>
                            <CustLogs height="50vh"/>
                        </Tab> : null
                    }
                </Tabs>
                
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={() => setDeleteAlert(!deleteAlert)}>{deleteAlert ? "Cancel" : "DELETE PROPERTY"}</Button>
                <Button variant="primary" onClick={() => props.onSave(activeProperty)}>Save Customer</Button>
                <Button variant="secondary" onClick={props.close}>Close</Button>
            </Modal.Footer>
            <Alert show={deleteAlert} variant="danger">
                <Alert.Heading>Delete Property?</Alert.Heading>
                <p>
                {activeProperty?.address}
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