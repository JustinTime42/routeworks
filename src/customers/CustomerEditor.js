import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Button, Modal, Form, Row, Col, Alert, Dropdown, Card, DropdownButton } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { createItem, editItem, hideModal, setActiveItem, setTempItem } from '../actions'
import PlacesAutocomplete, { geocodeByPlaceId, geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import { addDoc, arrayUnion, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import '../styles/driver.css'
import { UPDATE_CUSTOMERS_FAILED, UPDATE_CUSTOMERS_PENDING, UPDATE_CUSTOMERS_SUCCESS } from '../constants';

import _ from 'lodash'
import ButtonWithLoading from '../components/buttons/ButtonWithLoading'
import AsyncActionButton from '../components/buttons/AsyncActionButton'


// const contractTypes = ["Per Occurrence", "Monthly", "Seasonal", "Will Call", "Asphalt", "Hourly"]
// const sandContractTypes = ["Per Visit", "Per Yard"]
const editorSize = {marginTop: '2em', overflowY: "scroll"}

const CustomerEditor = ({cust}) => {
    
    const {customers, error, isPending} = useSelector(state => state.getAllCustomers.customers)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const vehicleTypes = useSelector(state => state.getTractorTypes.tractorTypes)
    const [customer, setCustomer] = useState(cust)    
    const [allTags, setAllTags] = useState([])
    const [newTagName, setNewTagName] = useState('')
    const [search, setSearch] = useState('')
    const [latLng, setLatLng] = useState({})
    const dispatch = useDispatch()
    // const { isLoaded } = useLoadScript({
    //     googleMapsApiKey: "AIzaSyA6XjIu8LiWPxKcxaWnLM_YOOUcmp2bAsU",
    //     libraries: ['places']
    //   });

    useEffect(() => {
        const getPosition = async() => {
            await navigator.geolocation.getCurrentPosition((position) => {
                setLatLng({lat: position.coords.latitude, lng: position.coords.longitude})
            })
        }
        getPosition()
    }, [])

    useEffect(() => {
        setCustomer(cust)
    }, [cust])

    useEffect(() => {
        console.log(customers)
    }, [customers])

    useEffect(() => {
        const unsub = onSnapshot(doc(db, `organizations`,  organization), (doc) => {
            setAllTags([...doc.data().tags])
        })
        return () => {
            unsub()
        }
    }, [])

    const tagChange = (event) => {
        let {target: {name, value} } = event
        let tagsArray = customer.tags ? customer.tags : []
        if (tagsArray.includes(name)) {
            tagsArray.splice(tagsArray.indexOf(name), 1)
        } else {
            tagsArray.push(name)
        }
        //let tags = tagsArray.join()
        setCustomer({...customer, tags: tagsArray})
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
        console.log(name, value)
        let vTypes = vehicleTypes.map(item => Object.values(item)[0]) 
        let numberValues = ['snow_price', 'value', 'price_per_yard', 'sweep_price', 'season_price', ...vTypes]
        if (numberValues.includes(name)){            
            value = !value ? null : Number(value)
        }
        if (value === "on") {
            setCustomer({...customer, [name]: !customer[name]})          
        } else if (name === 'newTagName') {
            setNewTagName(value)            
        }
        else {  
            setCustomer({...customer, [name]: value})
        }
    }

    const handleSelectPlace = async(address, placeId) => {
        const [place] = await geocodeByPlaceId(placeId);
        const {long_name:postalCode = ''} = place.address_components.find( c => c.types.includes('postal_code')) || {};
        let addressArray = address.split(',')
        setCustomer(
            {
                ...customer, 
                bill_address: addressArray[0],
                bill_city: addressArray[1],
                bill_state: addressArray[2],
                bill_zip: postalCode,
                location: {lat: place.geometry.location.lat() || null, lng: place.geometry.location.lng() || null}
            }
        )
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

    const onCustomerSave = (newDetails, close) => {
        console.log(newDetails)
        if (newDetails.id) {
            const {id, ...details} = newDetails         
            return updateDoc(doc(db, `organizations/${organization}/customers`, id), details)        
        } else {
            return addDoc(collection(db, `organizations/${organization}/customers`), newDetails)
        }
    }


    if (!customer) {
        return null
    }
    else return (      
        <Form className="border rounded p-2 m-2">
            <h4>Customer Information</h4>
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
  
            <Form.Label>Billing Address</Form.Label>                                                
            <Form.Group as={Row}>
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
            <Form.Label>Tags</Form.Label> 
            <Col className="col-xs-6">
            <Row>
                <Col className="col-m-2">
                <Form.Control name="newTagName" type="text" placeholder='enter new tag' value={newTagName} onChange={onChange}/>
                </Col>
                <Col>
                    <Button size='sm' variant='primary' onClick={() => saveNewTag(newTagName)}>add tag</Button>
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
            </Col>
            <div >
            <AsyncActionButton
                asyncAction={() => onCustomerSave(customer)}
                label = "Save Changes"
            />
            {/* <Button variant="primary" className="m-1" onClick={() => onCustomerSave(customer)}>Save Changes</Button> */}
            <Button variant="primary" className="m-1" onClick={() => setCustomer(cust)}>Reset Changes</Button> 
            </div> 
                      
        </Form>
    )    
}

export default CustomerEditor