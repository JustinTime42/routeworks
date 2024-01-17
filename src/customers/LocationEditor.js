import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Button, Modal, Form, Row, Col, Alert, Dropdown, Card, DropdownButton } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { createItem, editItem } from '../actions'
import PlacesAutocomplete, { geocodeByPlaceId, geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import { Timestamp, addDoc, arrayUnion, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import CustLogs from './CustLogs'
import '../styles/driver.css'
import { serviceLevels  } from '../globals'
import RoutePopover from '../components/customer_panels/RoutePopover'
import { GET_PRICING_TEMPLATES_SUCCESS, GET_VEHICLE_TYPES_SUCCESS, REQUEST_ROUTES_SUCCESS, SET_ACTIVE_PRICING_TEMPLATE, SET_ACTIVE_VEHICLE_TYPE, UPDATE_ADDRESSES_SUCCESS, UPDATE_CUSTOMERS_SUCCESS } from '../constants';
import SimpleSelector from '../pricing_templates/SimpleSelector'
import _ from 'lodash'
import { useLoadScript } from '@react-google-maps/api'
import SearchableInput from '../components/SearchableInput'
import TransferLocation from './TransferLocation'
import AsyncActionButton from '../components/buttons/AsyncActionButton'

// const contractTypes = ["Per Occurrence", "Monthly", "Seasonal", "Will Call", "Asphalt", "Hourly"]
// const sandContractTypes = ["Per Visit", "Per Yard"]
const editorSize = {marginTop: '2em', overflowY: "scroll"}

const PriceField = ({workType, priceField, pricingMultiple, location, onChangePrice, onDeletePrice, pricingBasis}) => {
    const [deleteAlert, setDeleteAlert] = useState(false)
      
    const onDelete = () => {
        setDeleteAlert(false)
        onDeletePrice(priceField, workType.id, pricingBasis)
    }

    return (
        <>
        <Form.Group style={{marginBottom: "1em", marginTop: "1em", display: "flex", flexDirection:"row", wrap:"no-wrap", alignItems:"baseline"}}>                
            <Form.Label>{priceField?.name}:</Form.Label>        
            <Form.Control 
                style={{width: "100px", marginLeft: "1em"}}
                name={priceField?.id} 
                type="number" 
                placeholder='price'
                value={location?.pricing?.workTypes?.[workType?.id]?.prices?.[priceField?.id] || ""} 
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

const LocationEditor = ({loc}) => {
    const routes = useSelector(state => state.requestRoutes.routes)
    const allLocations = useSelector(state => state.requestAllAddresses.addresses)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const vehicleTypes = useSelector(state => state.getTractorTypes.tractorTypes)
    const pricingTemplates = useSelector(state => state.getPricingTemplates.pricingTemplates)
    const workTypes = useSelector(state => state.getWorkTypes.allWorkTypes)
    const [matches, setMatches] = useState([])
    const [location, setLocation] = useState(loc || {})
    const [custSearch, setCustSearch] = useState(location?.cust_name || '')
    const [showLogs, setShowLogs] = useState(false)
    const [showTransfer, setShowTransfer] = useState(false)
  
    const dispatch = useDispatch()
    const [search, setSearch] = useState('')
    const [latLng, setLatLng] = useState({})
    // const { isLoaded } = useLoadScript({
    //     googleMapsApiKey: "AIzaSyA6XjIu8LiWPxKcxaWnLM_YOOUcmp2bAsU",
    //     libraries: ['places']
    //   });

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

    useEffect(() => {
        const getPosition = async() => {
            await navigator.geolocation.getCurrentPosition((position) => {
                setLatLng({lat: position.coords.latitude, lng: position.coords.longitude})
            })
        }
        getPosition()
    }, [])

    useEffect(() => {
        console.log(loc)
        setLocation(loc)
    }, [loc])


    const vehicleTypesQuery = () => {
        return onSnapshot(collection(db, `organizations/${organization}/vehicle_type`), (querySnapshot) => {
            dispatch({type:GET_VEHICLE_TYPES_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
        })
    }
    
    const onChange = (event) => {          
        let { target: { name, value } } = event
        console.log(name, value)
        let vTypes = vehicleTypes.map(item => Object.values(item)[0]) 
        let numberValues = ['snow_price', 'value', 'price_per_yard', 'sweep_price', 'season_price', ...vTypes]
        if (numberValues.includes(name)){
            value = !value ? null : Number(value)
        }
        if (value === "on") {
            setLocation({...location, [name]: !location[name]})         
        } 
        else {  
            setLocation({...location, [name]: value})
        }
    }

    const onChangePricingTemplate = (event) => {
        setLocation({...location, pricing: _.merge(location.pricing, pricingTemplates.find(i => i.id === event))})
    }

    const onDeletePrice = (price, workName, pricingBasis) => {
        let newLocation = {...location}
        if (pricingBasis === "Work Type") {
            delete newLocation.pricing.workTypes[workName]
        } else {
            delete newLocation.pricing.workTypes[workName].prices[price]
        }
        setLocation(newLocation)
    }

    const onChangePriceNote = (event) => {
      setLocation({...location, pricing: {...location.pricing, note: event.target.value}})
    }

    const onChangePrice = (event, workName) => {
        let { target: { name, value } } = event
        console.log(name, value)
        console.log(workName)
        let price = Number(value)
        let newLocation = {...location}
        newLocation.pricing.workTypes = {
            ...newLocation.pricing.workTypes, 
            [workName]: {...newLocation.pricing.workTypes[workName], 
                prices: {...newLocation.pricing.workTypes[workName]?.prices, 
                    [name]: price}}
        } 
        setLocation(newLocation)
        console.log(location)
    }

    const onAddVehicle = (vehicleName, workName) => {
        const vehicleID = vehicleTypes.find(i => i.name === vehicleName).id
        let newLocation = {...location}
        newLocation.pricing.workTypes = {
            ...newLocation.pricing.workTypes, 
            [workName]: {...newLocation.pricing.workTypes[workName], 
                prices: {...newLocation.pricing.workTypes[workName]?.prices, 
                    [vehicleID]: null}}
        }
        setLocation(newLocation)
    }

    const handleSelectPlace = async(address, placeId) => {
        const [place] = await geocodeByPlaceId(placeId);
        const {long_name:postalCode = ''} = place.address_components.find( c => c.types.includes('postal_code')) || {};
        let addressArray = address.split(',')
        setLocation({
          ...location, 
          service_address: addressArray[0], 
          service_city: addressArray[1], 
          service_state: addressArray[2], 
          service_zip: postalCode,
          location: {lat: place.geometry.location.lat() || null, lng: place.geometry.location.lng() || null}
        })        
    }

    const onChangeSearch = (address) => {
        setSearch(address)
    }

    const searchOptions = {
        locationBias: {
            center: latLng,
            radius: 50000
        },
        types:['address']
      }

    const unassignedVehicles = (workName) => {
        let unassigned = []
        vehicleTypes.forEach(type => {
            if (location.pricing.workTypes?.[workName]?.prices?.[type.id] === undefined) {
                unassigned.push(type)
            }
        })
        return unassigned
    }

    const onLocationSave = (newDetails) => {
        console.log(newDetails)
        if (allLocations.some(i => (i.service_address === newDetails.service_address) && (i.id !== newDetails.id))) {
            alert('This address is assigned to another customer')
            return
        }
        // edit relevant details on each route assigned
        const removeFields = (item) => {             
            return (
                {
                    id: item.id,
                    cust_name: item.cust_name, 
                    service_address: item.service_address || '',
                    service_level: item.service_level || null,
                    contract_type: item.contract_type || '',  
                    loc_name: item.loc_name || '',
                    showLocName: item.showLocName || false,        
                }
            )
        }
        const newTrimmedDetails = removeFields(newDetails)
        console.log(newTrimmedDetails)
        Object.values(newDetails.routesAssigned).forEach(route => {
            let newRoute = {...routes.find(i => i.name === route)}
            newRoute.customers[newDetails.loc_id] = {...newRoute.customers[newDetails.loc_id], ...newTrimmedDetails}             
            dispatch(editItem(newRoute, routes, `organizations/${organization}/route`, null, REQUEST_ROUTES_SUCCESS))
        })
        if (newDetails.id) {
            return updateDoc(doc(db, `organizations/${organization}/service_locations`, newDetails.id), newDetails)
        } else {
            return addDoc(collection(db, `organizations/${organization}/service_locations`), newDetails)
        }          
    }
    if (!location) {
        return null
    }
    else return (   
      <div style={{marginBottom: "2em"}}>
        <h3>{location.service_address}</h3>
          <Tabs defaultActiveKey='location'>
            <Tab eventKey='location' title='Location Info'>  
            <Form>
              <Col>
                <Form.Group className="m-2 justify-content-start" as={Row}>
                    <Form.Label column sm={4}>Location Label</Form.Label>
                    <Col sm={5}>
                        <Form.Control
                            name="loc_name"
                            type="text"
                            value={location?.loc_name || ''}
                            onChange={onChange}
                        />                                 
                    </Col>
                    <Col sm={3}>
                        <Form.Check                                
                            name="showLocName"
                            type="checkbox"
                            label="Show?"
                            checked={!!location?.showLocName}
                            onChange={onChange}
                            title="Show the location name instead of customer name on property card?"
                        />
                    </Col>
                </Form.Group>
                <Form.Label>Job Location</Form.Label> 
                <Button className="float-end mt-1" onClick={() => setShowLogs(true)}>View Service Logs</Button> 
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
                        })}[/]
                        </div>
                    </div>
                    )}
                </PlacesAutocomplete>                                
                <Form.Group as={Row}>
                    <Form.Label>Address</Form.Label>
                    <Col>
                        <Form.Control name="service_address" type="text" value={location?.service_address || ''} onChange={onChange}/>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label>City</Form.Label>
                    <Col>
                        <Form.Control name="service_city" type="text" value={location?.service_city || ''} onChange={onChange}/>
                    </Col>
                </Form.Group>
                <Row>
                <Col>
                <Form.Group>                                                                                                    
                    <Form.Label>State</Form.Label>   
                    <Form.Control name="service_state" type="text" value={location?.service_state || ''} onChange={onChange}/>
                </Form.Group>
                </Col>
                <Col>
                <Form.Group>
                    <Form.Label>Zip</Form.Label>                              
                    <Form.Control name="service_zip" type="text" value={location?.service_zip || ''} onChange={onChange}/> 
                </Form.Group>
                </Col>   
                </Row>                                                 
              </Col>  
            </Form> 
            </Tab>
            <Tab eventKey='job' title='Job Info' style={{overflowY:"scroll"}}>
                <Form>
                <Form.Group style={{display: "flex", flexDirection:"row", wrap:"no-wrap", justifyContent: "start"}}>
                    <Form.Label>Pricing Template:</Form.Label>
                    <DropdownButton 
                        style={{width: "200px", marginLeft: "1em"}} 
                        title={location?.pricing?.name || "Select"} 
                        onSelect={onChangePricingTemplate}
                    >
                        {
                            pricingTemplates.map(type => <Dropdown.Item key={type.id} eventKey={type.id}>{type.name}</Dropdown.Item>)
                        }
                    </DropdownButton>
                </Form.Group> 
                <Row> 
                    <Col xs={7} style={{overflowY:"scroll"}}>
                    {location?.pricing?.workTypes && Object.keys(location.pricing.workTypes).sort().map((workName, i) => {
                        const workType = location.pricing?.workTypes?.[workName]
                        if (workType?.pricingBasis === "Work Type") {                                
                            return (
                                <PriceField
                                    key={i}
                                    onDeletePrice={onDeletePrice}
                                    workType={workTypes.find(i => i.id === workName)}
                                    priceField={workTypes.find(i => i.id === workName)}
                                    pricingMultiple={workType?.pricingMultiple}
                                    location={location}
                                    onChangePrice={onChangePrice}
                                    pricingBasis={workType?.pricingBasis}
                                />
                            )
                        } else {
                            return (
                                <Card key={i} style={{padding: "1em"}}>
                                    <div style={{display: "flex", flexDirection:"row", wrap:"no-wrap"}}>
                                    <Form.Label style={{fontWeight:"bold"}}>{workTypes?.find(i => i.id === workName)?.name || ""} prices:</Form.Label>
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
                                    </div>
                                    {location?.pricing?.workTypes?.[workName]?.prices && 
                                        Object.keys(location.pricing.workTypes?.[workName]?.prices)                                            
                                        .map((vehicleType, i) => {
                                        const workObject=location.pricing.workTypes[workName]
                                        return (
                                            <PriceField
                                                key={i}
                                                onDeletePrice={onDeletePrice}
                                                workType={workTypes.find(i => i.id === workName)}
                                                priceField={vehicleTypes.find(type => type.id === vehicleType)}
                                                pricingMultiple={workObject?.pricingMultiple}
                                                customer={location}
                                                onChangePrice={onChangePrice}
                                                pricingBasis={workType?.pricingBasis}
                                            />
                                        )
                                    })}                                        
                                </Card>
                            )
                        }
                    })}
                    <Form.Label style={{marginTop: "1em"}}>Pricing Notes:</Form.Label>
                    <Form.Control name="note" as="textarea" rows="3" value={location?.pricing?.note || ''} onChange={onChangePriceNote}/>
                    </Col>
                    <Col xs={5}>                           
                    <Form.Group>
                        <Form.Label size='sm'>Surface Type</Form.Label>
                            <Form.Control size='sm' name="surface_type" as="select" value={location?.surface_type || ''} onChange={onChange}>
                                <option value="select">Select</option>
                                <option value="paved">Paved</option>
                                <option value="gravel">Gravel</option>
                                <option value="partial">Partial</option>
                            </Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Service Level</Form.Label>
                            <Form.Control name="service_level" as="select" value={location?.service_level || 'Select'} onChange={onChange}>
                                {
                                    serviceLevels.map((type, i) => <option key={type} value={i}>{type || "N/A"}</option>)
                                }
                            </Form.Control>
                    </Form.Group>                               
                      <Row>
                          <p>Routes Assigned: {location?.routesAssigned ? Object.keys(location.routesAssigned).map(i => <RoutePopover key={i} customer={location} route={i} />) : null}</p>
                      </Row>  
                    </Col>
                </Row>
                <Row style={{alignItems: "center"}}>
                    <Col>
                        <Form.Group>
                            <Form.Label>Notes</Form.Label>
                            <Form.Control name="notes" as="textarea" rows="3" value={location?.notes || ''} onChange={onChange}/>
                        </Form.Group>
                    </Col>
                </Row>                        
            </Form>
              <CustLogs show={showLogs} hideModal={() => setShowLogs(false)} admin={true} id={location.id}/>
            </Tab>
        </Tabs>
        <div>
          <AsyncActionButton
                asyncAction={() => onLocationSave(location)}
                label = "Save Changes"
            />
          <Button variant="primary" className="m-1" onClick={() => setLocation(loc)}>Reset Changes</Button>
            <Button variant="secondary" className="m-1 float-end" onClick={() => setShowTransfer(true)}>Transfer Location</Button> 
        </div> 
        <hr />  
        {showTransfer && <TransferLocation showTransfer={showTransfer} setShowTransfer={setShowTransfer} location={location}/>}
      </div> 

      
    )    
}

export default LocationEditor