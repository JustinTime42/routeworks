import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Button, Modal, Form, Row, Col, Alert, Dropdown, Card, DropdownButton } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { setTempItem } from '../../actions'
import PlacesAutocomplete, { geocodeByPlaceId, geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import { arrayUnion, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import CustLogs from '../customer_panels/CustLogs'
import '../../styles/driver.css'
import { serviceLevels  } from '../../globals'
import RoutePopover from '../customer_panels/RoutePopover'
import { useOutletContext } from 'react-router-dom'
import { GET_PRICING_TEMPLATES_SUCCESS, GET_VEHICLE_TYPES_SUCCESS, SET_ACTIVE_PRICING_TEMPLATE, SET_ACTIVE_VEHICLE_TYPE } from '../../constants';
import SimpleSelector from '../../pricing_templates/SimpleSelector'
import _ from 'lodash'
import { useLoadScript } from '@react-google-maps/api';
import axios from 'axios'
// const contractTypes = ["Per Occurrence", "Monthly", "Seasonal", "Will Call", "Asphalt", "Hourly"]
// const sandContractTypes = ["Per Visit", "Per Yard"]
const editorSize = {marginTop: '2em', overflowY: "scroll"}

const PriceField = ({workType, priceField, pricingMultiple, customer, onChangePrice, onDeletePrice, pricingBasis}) => {
    const [deleteAlert, setDeleteAlert] = useState(false)
      
    const onDelete = () => {
        setDeleteAlert(false)
        onDeletePrice(priceField, workType.id, pricingBasis)
    }

    return (
        <>
        <Form.Group style={{marginBottom: "1em", marginTop: "1em", display: "flex", flexDirection:"row", wrap:"no-wrap", alignItems:"baseline"}}>                
            <Form.Label>{priceField?.name} price:</Form.Label>        
            <Form.Control 
                style={{width: "100px", marginLeft: "1em"}}
                name={priceField?.id} 
                type="number" 
                value={customer?.pricing?.workTypes?.[workType?.id]?.prices?.[priceField?.id] || ""} 
                onChange={(event) => onChangePrice(event, workType.id)}/>
            <Form.Label style={{marginLeft: "1em"}}>{pricingMultiple}</Form.Label>
            <Button
                style={{marginLeft: "1em"}}
                variant="danger"
                size="sm"
                onClick={() => setDeleteAlert(true)}
            >delete</Button>
        </Form.Group>
        <Alert show={deleteAlert} variant="danger">
            <Alert.Heading>Confirm Delete Price Field?</Alert.Heading>
            This cannot be undone, but you can pull the blank price field in later from the template.
            <hr />
            <Button onClick={onDelete} variant="danger">
                Confirm Delete             
            </Button>
            <Button style={{marginLeft:"1em"}} onClick={() => setDeleteAlert(false)} variant="success">
                Cancel
            </Button>
        </Alert>
        </>
    )
}

const CustomerEditor = (props) => {
    const [onPropertySave, onCloseClick, onDelete] = useOutletContext()
    const customer = useSelector(state => state.setTempItem.item)
    const activeProperty = useSelector(state => state.setActiveProperty.activeProperty)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const vehicleTypes = useSelector(state => state.getTractorTypes.tractorTypes)
    const activeVehicleType = useSelector(state => state.setActiveVehicleType.activeVehicleType)
    const pricingTemplates = useSelector(state => state.getPricingTemplates.pricingTemplates)
    const workTypes = useSelector(state => state.getWorkTypes.allWorkTypes)
    const [pricingTemplate, setPricingTemplate] = useState(pricingTemplates.find(i => i.id === customer?.pricingTemplate))

    const modals = useSelector(state => state.whichModals.modals)
    const dispatch = useDispatch()
    const [deleteAlert, setDeleteAlert] = useState(false)
    const [allTags, setAllTags] = useState([])
    const [newTagName, setNewTagName] = useState('')
    const [sameAddress, setSameAddress] = useState(false)
    const [search, setSearch] = useState('')
    const [latLng, setLatLng] = useState({})
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: "AIzaSyA6XjIu8LiWPxKcxaWnLM_YOOUcmp2bAsU",
        libraries: ['places']
      });

    useEffect(() => {
        setSameAddress(false)
        setDeleteAlert(false)
    }, [customer])

    useEffect(() => {
        const unsub = onSnapshot(collection(db, `organizations/${organization}/pricing_templates`), (querySnapshot) => {
            if (querySnapshot.docs.length === 0) {
                return
            }
            dispatch({type:GET_PRICING_TEMPLATES_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
        })
        return () => {
            unsub()
        }
    }, [])

    // useEffect(() => {
    //     setPricingTemplate(pricingTemplates.find(i => i.id === customer?.pricingTemplate))
        
    // }, [pricingTemplates, customer])

    useEffect(() => {
        const getPosition = async() => {
            await navigator.geolocation.getCurrentPosition((position) => {
                setLatLng({lat: position.coords.latitude, lng: position.coords.longitude})
            })
        }
        getPosition()       
    }, [customer])

    useEffect(() => {
        const unsub = onSnapshot(doc(db, `organizations`,  organization), (doc) => {
            setAllTags([...doc.data().tags])
        })
        return () => {
            unsub()
        }
    }, [])

    const vehicleTypesQuery = () => {
        return onSnapshot(collection(db, `organizations/${organization}/vehicle_type`), (querySnapshot) => {
            dispatch({type:GET_VEHICLE_TYPES_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
        })
    }

    const tagChange = (event) => {
        let {target: {name, value} } = event
        let tagsArray = customer.tags ? customer.tags : []
        if (tagsArray.includes(name)) {
            tagsArray.splice(tagsArray.indexOf(name), 1)
        } else {
            tagsArray.push(name)
        }
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

    const onChangePricingTemplate = (event) => {
        // let { target: { name, value } } = event
        dispatch(setTempItem({...customer, pricing: _.merge(customer.pricing, pricingTemplates.find(i => i.id === event))}))
    }

    const onDeletePrice = (price, workName, pricingBasis) => {
        let newCustomer = {...customer}
        if (pricingBasis === "Work Type") {
            delete newCustomer.pricing.workTypes[workName]
        } else {
            delete newCustomer.pricing.workTypes[workName].prices[price]
        }
        dispatch(setTempItem(newCustomer))
    }

    const onChangePrice = (event, workName) => {
        let { target: { name, value } } = event
        let price = Number(value)
        let newCustomer = {...customer}
        newCustomer.pricing.workTypes = {...newCustomer.pricing.workTypes, [workName]: {...newCustomer.pricing.workTypes[workName], prices: {...newCustomer.pricing.workTypes[workName]?.prices, [name]: price}}} 
        dispatch(setTempItem(newCustomer))
        //{...customer, workTypes: {...customer?.workTypes, [name]: {...customer?.workTypes?.[name], prices: {...customer?.workTypes?.[name]?.prices, [name]: [price]}}}}
    }

    const onAddVehicle = (vehicleName, workName) => {
        const vehicleID = vehicleTypes.find(i => i.name === vehicleName).id
        let newCustomer = {...customer}
        newCustomer.pricing.workTypes = {...newCustomer.pricing.workTypes, [workName]: {...newCustomer.pricing.workTypes[workName], prices: {...newCustomer.pricing.workTypes[workName]?.prices, [vehicleID]: null}}}
        dispatch(setTempItem(newCustomer))
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
                service_zip: postalCode,
                location: {lat: place.geometry.location.lat() || null, lng: place.geometry.location.lng() || null}
            }
        ))
    }

    const onChangeSearch = (address) => {
        setSearch(address)
    }

    const searchOptions = {
        locationBias: {
            center: latLng,
            radius: 20000
        },
        types:['address']
      }

    const unassignedVehicles = (workName) => {
        let unassigned = []
        vehicleTypes.forEach(type => {
            if (customer.pricing.workTypes?.[workName]?.prices?.[type.id] === undefined) {
                unassigned.push(type)
            }
        })
        return unassigned
    }

    if (!isLoaded) return null

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
                <Tab eventKey='job' title='Job Info' style={{overflowY:"scroll"}}>
                    <Form>
                    <Form.Group style={{display: "flex", flexDirection:"row", wrap:"no-wrap", justifyContent: "start"}}>
                        <Form.Label>Pricing Template:</Form.Label>
                        <DropdownButton style={{width: "200px", marginLeft: "1em"}} title={customer?.pricing?.name || "Select"} onSelect={onChangePricingTemplate}>
                            {
                                pricingTemplates.map(type => <Dropdown.Item key={type.id} eventKey={type.id}>{type.name}</Dropdown.Item>)
                            }
                        </DropdownButton>
                    </Form.Group> 
                    <Row> 
                        <Col style={{overflowY:"scroll"}}>
                        {customer?.pricing?.workTypes && Object.keys(customer.pricing.workTypes).sort().map((workName, i) => {
                            const workType = customer.pricing?.workTypes[workName]
                            if (workType?.pricingBasis === "Work Type") {                                
                                return (
                                    <PriceField
                                        onDeletePrice={onDeletePrice}
                                        workType={workTypes.find(i => i.id === workName)}
                                        priceField={workTypes.find(i => i.id === workName)}
                                        pricingMultiple={workType?.pricingMultiple}
                                        customer={customer}
                                        onChangePrice={onChangePrice}
                                        pricingBasis={workType?.pricingBasis}
                                    />
                                )
                            } else {
                                return (
                                    <Card key={i} style={{padding: "1em"}}>
                                        <div style={{display: "flex", flexDirection:"row", wrap:"no-wrap"}}>
                                        <Form.Label style={{fontWeight:"bold"}}>{workTypes.find(i => i.id === workName).name} prices:</Form.Label>
                                        <SimpleSelector
                                            style={{marginLeft: "1em"}}
                                            title="Add Vehicle"
                                            collection="vehicle_types"
                                            collectionPath={`organizations/${organization}/`}
                                            selectedItem = {null}
                                            itemArray={unassignedVehicles(workName) || []}
                                            whichModal="VehicleType"
                                            onCreate={() => {}}
                                            onEdit={() => {}}
                                            onSelect={(event) => onAddVehicle(event, workName)}
                                            editable={false}
                                            dbQuery = {vehicleTypesQuery}
                                        />

                                            {/* <Form.Control name={workName}
                                                as="select"
                                                value={'Add Vehicle'}
                                                onChange={onAddVehicle}
                                            > 
                                            {vehicleTypes.map(type => {
                                                return customer.pricing.workTypes?.[workName]?.prices && Object.keys(customer.pricing.workTypes?.[workName]?.prices).includes(type.id) ? null : 
                                                    <option key={type.id} value={type.id}>{type.name}</option>
                                            })}                                                
                                            </Form.Control> */
                                        }
                                        </div>                                            
                                        {customer?.pricing?.workTypes?.[workName]?.prices && 
                                            Object.keys(customer.pricing.workTypes?.[workName]?.prices)                                            
                                            .map((vehicleType, i) => {
                                            const workObject=customer.pricing.workTypes[workName]
                                            return (
                                                <PriceField
                                                    onDeletePrice={onDeletePrice}
                                                    workType={workTypes.find(i => i.id === workName)}
                                                    priceField={vehicleTypes.find(type => type.id === vehicleType)}
                                                    pricingMultiple={workObject?.pricingMultiple}
                                                    customer={customer}
                                                    onChangePrice={onChangePrice}
                                                    pricingBasis={workType?.pricingBasis}
                                                />
                                            )
                                        })}                                        
                                    </Card>
                                )
                            }
                        })}
                        </Col>


                        {/* {
                        customer?.contract_type === "Hourly" ? 
                        <Col> 
                        <Form.Label size='sm'>Prices</Form.Label>
                        <Form.Group>
                            <Form.Label>Pricing Template</Form.Label>
                                <Form.Control name="pricingTemplate" as="select" value={customer?.pricingTemplate || ''} onChange={onChange}>
                                    <option value="select">Select</option>
                                    {
                                        pricingTemplates.map(type => <option key={type} value={type}>{type}</option>)
                                    }
                                </Form.Control>
                        </Form.Group>
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
                                        <Form.Label size='sm'>Sanding Price</Form.Label>
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
                        } */}
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
                            <Form.Label>Service Level</Form.Label>
                                <Form.Control name="service_level" as="select" value={customer?.service_level || 'Select'} onChange={onChange}>
                                    {
                                        serviceLevels.map((type, i) => <option key={type} value={i}>{type || "N/A"}</option>)
                                    }
                                </Form.Control>
                        </Form.Group>    
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
                        <CustLogs height="50vh" admin={true}/>
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