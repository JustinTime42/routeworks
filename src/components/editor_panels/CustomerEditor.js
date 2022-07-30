import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { requestAllAddresses, getRouteProperties, setTempItem } from '../../actions'
import axios from "axios"
import CustLogs from '../customer_panels/CustLogs'
import '../../styles/driver.css'
import { serviceLevels  } from '../../globals'
const contractTypes = ["Per Occurrence", "Monthly", "Seasonal", "5030", "Will Call", "Asphalt", "Hourly"]
const sandContractTypes = ["Per Visit", "Per Yard"]
const editorSize = {height:"90vh", marginTop: '2em'}

const CustomerEditor = (props) => {
    const customer = useSelector(state => state.setTempItem.item)
    const routeData = useSelector(state => state.getRouteData.routeData)
    const vehicleTypes = useSelector(state => state.getTractorTypes.tractorTypes)
    const modals = useSelector(state => state.whichModals.modals)
    const dispatch = useDispatch()
    const [api, setApi] = useState([customer ? "editproperty" : "newproperty"])
    const [deleteAlert, setDeleteAlert] = useState(false)
    const [allTags, setAllTags] = useState([])
    const [newTagName, setNewTagName] = useState('')
    const [sameAddress, setSameAddress] = useState(false)

    useEffect(() => {
        setApi(customer ? "editproperty" : "newproperty")
        setSameAddress(false)
        getTags()
    }, [customer])

    const getTags = () => {
        fetch(`${process.env.REACT_APP_API_URL}/alltags`)
        .then(res => res.json())
        .then(tags => setAllTags(tags))
        .catch(err => console.log(err))
    }

    const tagChange = (event) => {
        console.log(event)
        let {target: {name, value} } = event
        let tagsArray = customer.tags ? customer.tags?.split(',') : []
        if (tagsArray.includes(name)) {
            tagsArray.splice(tagsArray.indexOf(name), 1)
        } else {
            tagsArray.push(name)
        }
        let tags = tagsArray.join()
        dispatch(setTempItem({...customer, tags: tags}))
    }

    const saveNewTag = () => {
        axios.post(`${process.env.REACT_APP_API_URL}/newtag`, { tag_name: newTagName})
        .then(tag => setAllTags([...allTags, tag.data])) 
        .catch(err => console.log(err))
    }
    
    const onChange = (event, fields) => {    
        console.log(customer)    
        let { target: { name, value } } = event
        let vTypes = vehicleTypes.map(item => Object.values(item)[0]) 
        let numberValues = ['price', 'value', 'price_per_yard', 'sweep_price', 'season_price', ...vTypes]
        if (numberValues.includes(name)){
            value = !value ? null : Number(value)
        }
        if (value === "on") {
            dispatch(setTempItem({...customer, [fields]: {...customer[fields], [name]: !customer[name]}}))          
        } else if (name === 'newTagName') {
            setNewTagName(value)            
        }
        else {  
            dispatch(setTempItem({...customer,  [fields]: {...customer[fields], [name]: value}}))
        }
    }

    const clickSameAddress = () => {
        dispatch(setTempItem(
            {
                ...customer, 
                bill_address: customer.address,
                bill_city: customer.city,
                bill_state: customer.state,
                bill_zip: customer.zip,
            }
        ))
        setSameAddress(!sameAddress)
    }

    return (      
           <Modal className="scrollable" style={editorSize} show={modals.includes('Customer')} onHide={props.close} size='lg'>
            <Modal.Header>Customer Editor</Modal.Header>
            <Modal.Body>
                <Tabs defaultActiveKey='contact'>
                    <Tab eventKey='contact' title='Contact Info'>
                        <Form>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Name</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="cust_name" type="text" value={customer?.nonAdminFields?.cust_name || ''} onChange={e => onChange(e, 'nonAdminFields')}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>First Name</Form.Label>
                                <Col sm={4}>
                                    <Form.Control name="cust_fname" type="text" value={customer?.nonAdminFields?.cust_fname || ''} onChange={e => onChange(e, 'nonAdminFields')}/>
                                </Col>
                                <Form.Label column sm={2}>Last Name</Form.Label>
                                <Col sm={4}>
                                    <Form.Control name="cust_lname" type="text" value={customer?.nonAdminFields?.cust_lname || ''} onChange={e => onChange(e, 'nonAdminFields')}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Phone</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="cust_phone" type="text" value={customer?.nonAdminFields?.cust_phone || ''} onChange={e => onChange(e, 'nonAdminFields')}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Email</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="cust_email" type="text" value={customer?.nonAdminFields?.cust_email || ''} onChange={e => onChange(e, 'nonAdminFields')}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Email 2</Form.Label>
                                <Col sm={6}>
                                    <Form.Control name="cust_email2" type="text" value={customer?.nonAdminFields?.cust_email2 || ''} onChange={e => onChange(e, 'nonAdminFields')}/>
                                </Col>
                                <Col sm={4}>
                                    <Form.Check
                                        name="include_email2"
                                        type="checkbox"
                                        label="Include Email2?"
                                        checked = {!!customer?.nonAdminFields?.include_email2}
                                        onChange={e => onChange(e, 'nonAdminFields')}
                                    /> 
                                </Col>
                            </Form.Group>                        
                        <Row>
                    <Col>
                        <Form.Label>Job Location</Form.Label>                  
                        <Form.Group as={Row}>
                            <Form.Label>Address</Form.Label>
                            <Col>
                                <Form.Control name="address" type="text" value={customer?.nonAdminFields?.address || ''} onChange={e => onChange(e, 'nonAdminFields')}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label>City</Form.Label>
                            <Col>
                                <Form.Control name="city" type="text" value={customer?.nonAdminFields?.city || ''} onChange={e => onChange(e, 'nonAdminFields')}/>
                            </Col>
                        </Form.Group>
                        <Row>
                        <Col>
                        <Form.Group>                                                                                                    
                            <Form.Label>State</Form.Label>   
                            <Form.Control name="state" type="text" value={customer?.nonAdminFields?.state || ''} onChange={e => onChange(e, 'nonAdminFields')}/>
                        </Form.Group>
                        </Col>
                        <Col>
                        <Form.Group>
                            <Form.Label>Zip</Form.Label>                              
                            <Form.Control name="zip" type="text" value={customer?.nonAdminFields?.zip || ''} onChange={e => onChange(e, 'nonAdminFields')}/> 
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
                                <Form.Control name="bill_address" type="text" value={customer?.nonAdminFields?.bill_address || ''} onChange={e => onChange(e, 'nonAdminFields')}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label>City</Form.Label>
                            <Col>
                                <Form.Control name="bill_city" type="text" value={customer?.nonAdminFields?.bill_city || ''} onChange={e => onChange(e, 'nonAdminFields')}/>
                            </Col>
                        </Form.Group>
                        <Row>                                
                        <Col>
                        <Form.Group>                                                                                                    
                            <Form.Label>State</Form.Label>   
                            <Form.Control name="bill_state" type="text" value={customer?.nonAdminFields?.bill_state || ''} onChange={e => onChange(e, 'nonAdminFields')}/>
                        </Form.Group>
                        </Col>
                        <Col>
                        <Form.Group>
                            <Form.Label>Zip</Form.Label>                              
                            <Form.Control name="bill_zip" type="text" value={customer?.nonAdminFields?.bill_zip || ''} onChange={e => onChange(e, 'nonAdminFields')}/> 
                        </Form.Group>
                        </Col>   
                        </Row>
                    </Col>
                    </Row>                    
                    </Form>
                    </Tab>
                    <Tab eventKey='job' title='Job Info'>
                        <Form>
                        <Row> 
                            {
                            customer?.contract_type === "Hourly" ? 
                            <Col> 
                            <Form.Label size='sm'>Prices</Form.Label>
                            {
                            vehicleTypes.map((item, i) => {  
                                return (
                                    <Form.Group key = {i}>
                                        <Row>  
                                            <Col xs={8}>
                                                <Form.Label size='sm'>{item.name} Price</Form.Label>
                                            </Col>
                                            <Col>
                                                <Form.Control size='sm' name={item.name} type="number" value={customer.adminFields[item.name] || ''} onChange={e => onChange(e, 'adminFields')}/>
                                            </Col>
                                        </Row>                                    
                                    </Form.Group>
                                )
                            })
                            }
                                <Form.Group>
                                <Row>
                                    <Col xs={8}>
                                        <Form.Label size='sm'>Sanding Price Per Yard</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control size='sm' name="price_per_yard" type="number" value={customer?.adminFields?.price_per_yard || ''} onChange={e => onChange(e, 'adminFields')}/>
                                    </Col>
                                </Row>
                                </Form.Group>
                                <Form.Group>                                
                                </Form.Group>
                            </Col>
                            :                        
                            <Col> 
                                <Form.Label size='sm'>Prices</Form.Label>
                                    <Form.Group>
                                        <Row>  
                                            <Col xs={8}>
                                                <Form.Label size='sm'>Snow Price</Form.Label>
                                            </Col>
                                            <Col>
                                                <Form.Control size='sm' name="price" type="number" value={customer?.adminFields?.price || ''} onChange={e => onChange(e, 'adminFields')}/>
                                            </Col>
                                        </Row>                                    
                                    </Form.Group>
                                    <Form.Group>
                                        <Row>  
                                            <Col xs={8}>
                                                <Form.Label size='sm'>Seasonal Price</Form.Label>
                                            </Col>
                                            <Col>
                                                <Form.Control size='sm' name="season_price" type="number" value={customer?.adminFields?.season_price || ''} onChange={e => onChange(e, 'adminFields')}/>
                                            </Col>
                                        </Row>                                    
                                    </Form.Group>
                                    <Form.Group>
                                    <Row>
                                        <Col xs={8}>
                                            <Form.Label size='sm'>Sweeping Price</Form.Label>
                                        </Col>                                    
                                        <Col>
                                            <Form.Control size='sm' name="sweep_price" type="number" value={customer?.adminFields?.sweep_price || ''} onChange={e => onChange(e, 'adminFields')}/>
                                        </Col>
                                    </Row>
                                    </Form.Group>
                                    <Form.Group>
                                    <Row>
                                        <Col xs={8}>
                                            <Form.Label size='sm'>Sanding Price Per Yard</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control size='sm' name="price_per_yard" type="number" value={customer?.adminFields?.price_per_yard || ''} onChange={e => onChange(e, 'adminFields')}/>
                                        </Col>
                                    </Row>
                                    </Form.Group>
                                    <Form.Group>
                                    <Row>
                                        <Col xs={8}>
                                        <Form.Label size='sm'>Value</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control size='sm' name="value" type="number" value={customer?.adminFields?.value || ''} onChange={e => onChange(e, 'adminFields')}/>
                                        </Col>
                                    </Row>
                                    </Form.Group>
                                </Col>
                            }
                            <Col>                           
                            <Form.Group>
                                <Form.Label size='sm'>Surface Type</Form.Label>
                                    <Form.Control size='sm' name="surface_type" as="select" value={customer?.nonAdminFields?.surface_type || ''} onChange={e => onChange(e, 'nonAdminFields')}>
                                        <option value="select">Select</option>
                                        <option value="paved">Paved</option>
                                        <option value="gravel">Gravel</option>
                                        <option value="partial">Partial</option>
                                    </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Contract Type</Form.Label>
                                    <Form.Control name="contract_type" as="select" value={customer?.nonAdminFields?.contract_type || ''} onChange={e => onChange(e, 'nonAdminFields')}>
                                        {
                                            contractTypes.map(type => <option key={type} value={type}>{type}</option>)
                                        }
                                    </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Service Level</Form.Label>
                                    <Form.Control name="service_level" as="select" value={customer?.nonAdminFields?.service_level || ''} onChange={e => onChange(e, 'nonAdminFields')}>
                                        {
                                            serviceLevels.map((type, i) => <option key={type} value={i}>{type}</option>)
                                        }
                                    </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Sanding Contract</Form.Label>
                                    <Form.Control name="sand_contract" as="select" value={customer?.nonAdminFields?.sand_contract || ''} onChange={e => onChange(e, 'nonAdminFields')}>
                                        {
                                            sandContractTypes.map(type => <option key={type} value={type}>{type}</option>)
                                        }
                                    </Form.Control>
                            </Form.Group>                            
                        </Col>
                            <Col>
                                <Form.Label>Tags</Form.Label> 
                                <Row style={{marginBottom: '1em'}}>
                                    <Col>
                                        <Button size='sm' variant='primary' onClick={saveNewTag}>add tag</Button>
                                    </Col>
                                    <Col>
                                        <Form.Control name="newTagName" type="text" placeholder={newTagName} onChange={e => onChange(e, 'nonAdminFields')}/>
                                    </Col>
                                </Row>
                                {                                    
                                    allTags.map((tag, i) => {
                                        return(       
                                            <Row key={i}>
                                                <Col xs={7}>
                                                    <Form.Check                                                          
                                                        name={tag}
                                                        type="checkbox"
                                                        label={tag}
                                                        checked = {customer?.nonAdminFields?.tags?.includes(tag) || false}
                                                        onChange={tagChange}
                                                    />  
                                                </Col>
                                            </Row>                                       
                                        )                               
                                    })                                    
                                }
                                <Row>
                                    <Form.Label>Routes Assigned:</Form.Label>
                                {
                                    routeData.map((entry, i) => {                                        
                                        if (entry.property_key === customer?.key) {
                                            return (
                                                <Form.Label key={i}>{entry.route_name}, </Form.Label>
                                            )
                                        } else return null
                                    })
                                }
                                </Row>  
                            </Col>
                        </Row>
                        <Row style={{alignItems: "center"}}>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Notes</Form.Label>
                                    <Form.Control name="notes" as="textarea" rows="3" value={customer?.nonAdminFields?.notes || ''} onChange={e => onChange(e, 'nonAdminFields')}/>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Check
                                    name="is_new"
                                    type="checkbox"
                                    label="New?"
                                    checked = {!!customer?.nonAdminFields?.is_new}
                                    onChange={e => onChange(e, 'nonAdminFields')}
                                />   
                                <Form.Check 
                                    name="active"
                                    type="checkbox"
                                    label="active?"
                                    checked = {!!customer?.nonAdminFields?.active}
                                    onChange={e => onChange(e, 'nonAdminFields')}
                                />
                                <Form.Check
                                    name="temp"
                                    type="checkbox"
                                    label="Temporary?"
                                    checked = {!!customer?.nonAdminFields?.temp}
                                    onChange={e => onChange(e, 'nonAdminFields')}
                                />
                                <Form.Check
                                    name="priority"
                                    type="checkbox"
                                    label="Priority?"
                                    checked = {!!customer?.nonAdminFields?.priority}
                                    onChange={e => onChange(e, 'nonAdminFields')} //not yet implemented
                                />
                            </Col>
                        </Row>                        
                    </Form> 
                    </Tab>
                    {
                        customer?.key ?
                        <Tab eventKey='logs' title='Service Logs'>
                            <CustLogs height="50vh"/>
                        </Tab> : null
                    }
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={() => setDeleteAlert(!deleteAlert)}>{deleteAlert ? "Cancel" : "DELETE PROPERTY"}</Button>
                <Button variant="primary" onClick={() => props.onSave(customer)}>Save Customer</Button>
                <Button variant="secondary" onClick={props.close}>Close</Button>
            </Modal.Footer>
            <Alert show={deleteAlert} variant="danger">
                <Alert.Heading>Delete Property?</Alert.Heading>
                <p>
                {customer?.address}
                </p>
                <hr />
                <div className="d-flex justify-content-end">
                <Button onClick={() => props.onDelete(customer)} variant="outline-success">
                    Permanently Delete This Property
                </Button>
                </div>
            </Alert>
        </Modal> 
    )    
}

export default CustomerEditor