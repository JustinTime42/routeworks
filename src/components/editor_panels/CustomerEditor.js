import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { setTempItem } from '../../actions'
import PlacesAutocomplete, { geocodeByPlaceId, geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import { arrayUnion, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import CustLogs from '../customer_panels/CustLogs'
import '../../styles/driver.css'
import { serviceLevels  } from '../../globals'
import RoutePopover from '../customer_panels/RoutePopover'
import { useOutletContext } from 'react-router-dom'
const contractTypes = ["Per Occurrence", "Monthly", "Seasonal", "5030", "Will Call", "Asphalt", "Hourly"]
const sandContractTypes = ["Per Visit", "Per Yard"]
const editorSize = {height:"100vh", marginTop: '2em'}

const CustomerEditor = (props) => {
    const [onPropertySave, onCloseClick, onDelete] = useOutletContext()
    const customer = useSelector(state => state.setTempItem.item)
    const activeProperty = useSelector(state => state.setActiveProperty.activeProperty)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const vehicleTypes = useSelector(state => state.getTractorTypes.tractorTypes)
    const modals = useSelector(state => state.whichModals.modals)
    const dispatch = useDispatch()
    const [deleteAlert, setDeleteAlert] = useState(false)
    const [allTags, setAllTags] = useState([])
    const [newTagName, setNewTagName] = useState('')
    const [sameAddress, setSameAddress] = useState(false)
    const [search, setSearch] = useState('')
    const [bounds, setBounds] = useState({})

    useEffect(() => {
        setSameAddress(false)
        setDeleteAlert(false)
    }, [customer])

    // useEffect(() => {
    //     dispatch(setTempItem(activeProperty))
    // },[activeProperty])

    useEffect(() => {
        let center = {lat: 0, lng: 0}
        const getPosition = async() => {
            await navigator.geolocation.getCurrentPosition((position) => {
                center.lat = position.coords.latitude
                center.lng = position.coords.longitude
                setBounds({
                    north: center.lat + 1,
                    south: center.lat - 1,
                    east: center.lng + 1,
                    west: center.lng - 1,
                })
            })
        }
        getPosition()       
    }, [customer])

    useEffect(() => {
        const unsub = onSnapshot(doc(db, `organizations`,  organization), (doc) => {
            console.log(doc.data().tags)
            setAllTags([...doc.data().tags])
        })
        return () => {
            unsub()
        }
    }, [])

    const tagChange = (event) => {
        console.log(event)
        console.log(customer)
        let {target: {name, value} } = event
        let tagsArray = customer.tags ? customer.tags : []
        if (tagsArray.includes(name)) {
            tagsArray.splice(tagsArray.indexOf(name), 1)
        } else {
            tagsArray.push(name)
        }
        console.log(tagsArray)
        //let tags = tagsArray.join()
        dispatch(setTempItem({...customer, tags: tagsArray}))
    }

    const saveNewTag = async(newTag) => {
        if(newTagName) {
            const tagsRef = doc(db, `organizations`, `${organization}`)
            await updateDoc(tagsRef, {
                tags: arrayUnion(newTag)
            })
        }
    }
    
    const onChange = (event) => {
        console.log(customer)    
        let { target: { name, value } } = event
        let vTypes = vehicleTypes.map(item => Object.values(item)[0]) 
        let numberValues = ['snow_price', 'value', 'price_per_yard', 'sweep_price', 'season_price', ...vTypes]
        if (numberValues.includes(name)){
            value = !value ? null : Number(value)
        }
        if (value === "on") {
            dispatch(setTempItem({...customer, [name]: !customer[name]}))          
        } else if (name === 'newTagName') {
            setNewTagName(value)            
        }
        else {  
            dispatch(setTempItem({...customer,  [name]: value}))
        }
    }

    const clickSameAddress = () => {
        dispatch(setTempItem(
            {
                ...customer, 
                bill_address: customer.service_address,
                bill_city: customer.service_city,
                bill_state: customer.service_state,
                bill_zip: customer.service_zip,
            }
        ))
        setSameAddress(!sameAddress)
    }

    const handleSelectPlace = async(address, placeId) => {
        const [place] = await geocodeByPlaceId(placeId);
        const {long_name:postalCode = ''} = place.address_components.find( c => c.types.includes('postal_code')) || {};
        let addressArray = address.split(',')
        dispatch(setTempItem(
            {
                ...customer, 
                service_address: addressArray[0],
                service_city: addressArray[1],
                service_state: addressArray[2],
                service_zip: postalCode

            }
        ))
    }

    const onChangeSearch = (address) => {
        setSearch(address)
    }

    const searchOptions = {
        bounds: bounds,
        radius: 20000,
        types: ['address']
      }

    return (      
        <Modal className="scrollable" style={editorSize} show={modals.includes('Customer')} onHide={onCloseClick} size='lg'>
        <Modal.Header>Customer Editor</Modal.Header>
        <Modal.Body>
            <Tabs defaultActiveKey='contact'>
                <Tab eventKey='contact' title='Contact Info'>
                    <Form>
                        <Form.Group as={Row}>
                            <Form.Label column sm={2}>Name</Form.Label>
                            <Col sm={10}>
                                <Form.Control name="cust_name" type="text" value={customer?.cust_name || ''} onChange={onChange}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column sm={2}>First Name</Form.Label>
                            <Col sm={4}>
                                <Form.Control name="cust_fname" type="text" value={customer?.cust_fname || ''} onChange={onChange}/>
                            </Col>
                            <Form.Label column sm={2}>Last Name</Form.Label>
                            <Col sm={4}>
                                <Form.Control name="cust_lname" type="text" value={customer?.cust_lname || ''} onChange={onChange}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column sm={2}>Phone</Form.Label>
                            <Col sm={10}>
                                <Form.Control name="cust_phone" type="text" value={customer?.cust_phone || ''} onChange={onChange}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column sm={2}>Email</Form.Label>
                            <Col sm={10}>
                                <Form.Control name="cust_email" type="text" value={customer?.cust_email || ''} onChange={onChange}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column sm={2}>Email 2</Form.Label>
                            <Col sm={6}>
                                <Form.Control name="cust_email2" type="text" value={customer?.cust_email2 || ''} onChange={onChange}/>
                            </Col>
                            <Col sm={4}>
                                <Form.Check
                                    name="include_email2"
                                    type="checkbox"
                                    label="Include Email2?"
                                    checked = {!!customer?.include_email2}
                                    onChange={onChange}
                                /> 
                            </Col>
                        </Form.Group>                        
                    <Row>
                <Col>
                    <Form.Label>Job Location</Form.Label> 
                    <PlacesAutocomplete
                        value={search}
                        onChange={onChangeSearch}
                        onSelect={handleSelectPlace}
                        searchOptions={searchOptions}
                        shouldFetchSuggestions={search.length > 3}
                    >
                        {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                        <div>
                            <input 
                            {...getInputProps({
                                placeholder: 'Search Places ...',
                                className: 'location-search-input'
                            })}
                            />
                            <div className="autocomplete-dropdown-container">
                            {suggestions.map(suggestion => {
                                console.log(suggestion)
                                const className = suggestion.active ? 'suggestion-item--active' : 'suggestion-item';
                                // inline style for demonstration purpose
                                const style = suggestion.active
                                            ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                            : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                return (
                                <div key={suggestion.description} {...getSuggestionItemProps(suggestion)}>
                                    <span>{suggestion.description}</span>
                                </div>
                                )
                            })}
                            </div>
                        </div>
                        )}
                    </PlacesAutocomplete>                 
                    <Form.Group as={Row}>
                        <Form.Label>Address</Form.Label>
                        <Col>
                            <Form.Control name="service_address" type="text" value={customer?.service_address || ''} onChange={onChange}/>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label>City</Form.Label>
                        <Col>
                            <Form.Control name="service_city" type="text" value={customer?.service_city || ''} onChange={onChange}/>
                        </Col>
                    </Form.Group>
                    <Row>
                    <Col>
                    <Form.Group>                                                                                                    
                        <Form.Label>State</Form.Label>   
                        <Form.Control name="service_state" type="text" value={customer?.service_state || ''} onChange={onChange}/>
                    </Form.Group>
                    </Col>
                    <Col>
                    <Form.Group>
                        <Form.Label>Zip</Form.Label>                              
                        <Form.Control name="service_zip" type="text" value={customer?.service_zip || ''} onChange={onChange}/> 
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
                            <Form.Control name="bill_address" type="text" value={customer?.bill_address || ''} onChange={onChange}/>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label>City</Form.Label>
                        <Col>
                            <Form.Control name="bill_city" type="text" value={customer?.bill_city || ''} onChange={onChange}/>
                        </Col>
                    </Form.Group>
                    <Row>                                
                    <Col>
                    <Form.Group>                                                                                                    
                        <Form.Label>State</Form.Label>   
                        <Form.Control name="bill_state" type="text" value={customer?.bill_state || ''} onChange={onChange}/>
                    </Form.Group>
                    </Col>
                    <Col>
                    <Form.Group>
                        <Form.Label>Zip</Form.Label>                              
                        <Form.Control name="bill_zip" type="text" value={customer?.bill_zip || ''} onChange={onChange}/> 
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
                                        <Col xs={6}>
                                            <Form.Label size='sm'>{item.name} Price</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control size='sm' name={item.name} type="number" value={customer[item.name] || ''} onChange={onChange}/>
                                        </Col>
                                    </Row>                                    
                                </Form.Group>
                            )
                        })
                        }
                            <Form.Group>
                            <Row>
                                <Col xs={6}>
                                    <Form.Label size='sm'>Sanding Price</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control size='sm' name="price_per_yard" type="number" value={customer?.price_per_yard || ''} onChange={onChange}/>
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
                                        <Col xs={6}>
                                            <Form.Label size='med'>Snow Price</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control size="sm" name="snow_price" type="number" value={customer?.snow_price || ''} onChange={onChange}/>
                                        </Col>
                                    </Row>                                    
                                </Form.Group>
                                <Form.Group>
                                    <Row>  
                                        <Col xs={6}>
                                            <Form.Label size='sm'>Seasonal Price</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control size='sm' name="season_price" type="number" value={customer?.season_price || ''} onChange={onChange}/>
                                        </Col>
                                    </Row>                                    
                                </Form.Group>
                                <Form.Group>
                                <Row>
                                    <Col xs={6}>
                                        <Form.Label size='sm'>Sweeping Price</Form.Label>
                                    </Col>                                    
                                    <Col>
                                        <Form.Control size='sm' name="sweep_price" type="number" value={customer?.sweep_price || ''} onChange={onChange}/>
                                    </Col>
                                </Row>
                                </Form.Group>
                                <Form.Group>
                                <Row>
                                    <Col xs={6}>
                                        <Form.Label size='sm'>Sanding Price Per Yard</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control size='sm' name="price_per_yard" type="number" value={customer?.price_per_yard || ''} onChange={onChange}/>
                                    </Col>
                                </Row>
                                </Form.Group>
                                <Form.Group>
                                <Row>
                                    <Col xs={6}>
                                    <Form.Label size='sm'>Value</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control size='sm' name="value" type="number" value={customer?.value || ''} onChange={onChange}/>
                                    </Col>
                                </Row>
                                </Form.Group>
                            </Col>
                        }
                        <Col>                           
                        <Form.Group>
                            <Form.Label size='sm'>Surface Type</Form.Label>
                                <Form.Control size='sm' name="surface_type" as="select" value={customer?.surface_type || ''} onChange={onChange}>
                                    <option value="select">Select</option>
                                    <option value="paved">Paved</option>
                                    <option value="gravel">Gravel</option>
                                    <option value="partial">Partial</option>
                                </Form.Control>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Contract Type</Form.Label>
                                <Form.Control name="contract_type" as="select" value={customer?.contract_type || ''} onChange={onChange}>
                                    <option value="select">Select</option>
                                    {
                                        contractTypes.map(type => <option key={type} value={type}>{type}</option>)
                                    }
                                </Form.Control>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Service Level</Form.Label>
                                <Form.Control name="service_level" as="select" value={customer?.service_level || ''} onChange={onChange}>
                                    {
                                        serviceLevels.map((type, i) => <option key={type} value={i}>{type}</option>)
                                    }
                                </Form.Control>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Sanding Contract</Form.Label>
                                <Form.Control name="sand_contract" as="select" value={customer?.sand_contract || ''} onChange={onChange}>
                                <option value="select">Select</option>
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
                                    <Button size='sm' variant='primary' onClick={() => saveNewTag(newTagName)}>add tag</Button>
                                </Col>
                                <Col>
                                    <Form.Control name="newTagName" type="text" placeholder={newTagName} onChange={onChange}/>
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
                                                    checked = {customer?.tags?.includes(tag) || false}
                                                    onChange={tagChange}
                                                />  
                                            </Col>
                                        </Row>                                       
                                    )                               
                                })                                    
                            }
                            <Row>
                                <p>Routes Assigned: {customer?.routesAssigned ? Object.keys(customer.routesAssigned).map(i => <RoutePopover key={i} customer={customer} route={i} />) : null}</p>
                            </Row>  
                        </Col>
                    </Row>
                    <Row style={{alignItems: "center"}}>
                        <Col>
                            <Form.Group>
                                <Form.Label>Notes</Form.Label>
                                <Form.Control name="notes" as="textarea" rows="3" value={customer?.notes || ''} onChange={onChange}/>
                            </Form.Group>
                        </Col>                            
                    </Row>                        
                </Form> 
                </Tab>
                {
                    customer?.id ?
                    <Tab eventKey='logs' title='Service Logs' mountOnEnter={true} unmountOnExit={true}>
                        <CustLogs height="50vh"/>
                    </Tab> : null
                }
            </Tabs>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="danger" onClick={() => setDeleteAlert(!deleteAlert)}>{deleteAlert ? "Cancel" : "DELETE PROPERTY"}</Button>
            <Button variant="primary" onClick={() => onPropertySave(customer, false)}>Save</Button>
            <Button variant="primary" onClick={() => onPropertySave(customer, true)}>Save and Close</Button>
            <Button variant="secondary" onClick={onCloseClick}>Cancel</Button>
        </Modal.Footer>
        <Alert show={deleteAlert} variant="danger">
            <Alert.Heading>Delete Property?</Alert.Heading>
            <p>
            {customer?.address}
            </p>
            <hr />
            <div className="d-flex justify-content-end">
            <Button onClick={() => onDelete(customer)} variant="outline-success">
                Permanently Delete This Property
            </Button>
            </div>
        </Alert>
    </Modal> 
    )    
}

export default CustomerEditor