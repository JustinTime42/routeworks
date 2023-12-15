import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Button, Modal, Form, Row, Col, Alert, Dropdown, Card, DropdownButton } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { createItem, editItem, hideModal, setActiveItem, setTempItem } from '../actions'
import PlacesAutocomplete, { geocodeByPlaceId, geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import { addDoc, arrayUnion, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import '../styles/driver.css'
import { UPDATE_CUSTOMERS_SUCCESS } from '../constants';

import _ from 'lodash'


// const contractTypes = ["Per Occurrence", "Monthly", "Seasonal", "Will Call", "Asphalt", "Hourly"]
// const sandContractTypes = ["Per Visit", "Per Yard"]
const editorSize = {marginTop: '2em', overflowY: "scroll"}

const CustomerEditor = ({cust}) => {
    const customer = {...cust}
    const customers = useSelector(state => state.getAllCustomers.customers)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const vehicleTypes = useSelector(state => state.getTractorTypes.tractorTypes)


    const modals = useSelector(state => state.whichModals.modals)
    const dispatch = useDispatch()
    const [deleteAlert, setDeleteAlert] = useState(false)
    const [allTags, setAllTags] = useState([])
    const [newTagName, setNewTagName] = useState('')
    const [search, setSearch] = useState('')
    const [latLng, setLatLng] = useState({})
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
        console.log(name, value)
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
            radius: 50000
        },
        types:['address']
      }

    const onCustomerSave = (newDetails, close) => {
        console.log(newDetails)
        if (newDetails.cust_id) {
            dispatch(editItem(newDetails, customers, `organizations/${organization}/customers`, null, UPDATE_CUSTOMERS_SUCCESS))         
        } else {
          dispatch(createItem(newDetails, customers, `organizations/${organization}/customers`, null, UPDATE_CUSTOMERS_SUCCESS)) 
        }
    }


    if (!customer) {
        return null
    }
    else return (      
      <Form className="border-danger">
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
      <Button variant="primary" onClick={() => onCustomerSave(customer)}>Save</Button>
      <Button variant="primary" onClick={() => onCustomerSave(customer)}>Save and Close</Button>                        
        </Form>
    )    
}

export default CustomerEditor