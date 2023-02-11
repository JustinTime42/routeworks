import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { FormControl, ListGroup } from 'react-bootstrap'
import { setActiveItem, filterProperties } from '../actions'
import { SET_ACTIVE_PROPERTY } from '../constants'
import { scrollCardIntoView } from '../components/utils'

const SearchBar = () => {

    const [searchValue, setSearchValue] = useState('')
    const [matches, setMatches] = useState([])
    const allCustomers = useSelector(state => state.requestAllAddresses.addresses)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const activeProperty = useSelector(state => state.setActiveProperty.activeProperty)
    const dispatch = useDispatch()
    let location = useLocation()

    useEffect(() => {
        onSetMatches()
    }, [searchValue]) 

    useEffect(() => {
        if (location.pathname !== '/routebuilder') {
            setSearchValue('')
        } 
        if (matches !== '') {
            onSetMatches()
        }        
    }, [activeRoute])

    const selectCustomer = (customer) => {
        // Find out if the customer is on current route
        
        let isOnRoute = activeRoute.customers.find(entry => (entry.id === customer.id))
              
        if (isOnRoute) {
            console.log("isonroute", isOnRoute)  
            scrollCustomerIntoView(customer)
        }        
        dispatch(setActiveItem(customer, allCustomers, SET_ACTIVE_PROPERTY))
        setMatches([])
        //if (location.pathname !== '/routebuilder') setSearchValue('')
    }

    const scrollCustomerIntoView = (customer) => {
        console.log(customer)
        let custIndex
        if(location.pathname === '/routebuilder') {
            custIndex = activeRoute.customers.findIndex(i => i.id === customer.id)
        } else {
            custIndex = activeRoute.customers.filter(i => i.active).findIndex(i => i.id === customer.id)
        }     
        scrollCardIntoView(custIndex)           
    }



    const listStyle = {
        position: "absolute", 
       // height: "200px",
        overflow: "scroll",
        zIndex: "99",
        visibility: ((matches.length > 0) && !(location.pathname ==='/routebuilder')) ? "visible" : "hidden"
    }

    const itemStyle = {
        whiteSpace: "nowrap",
    }


    const updateMatches = () => {
        let index = matches.findIndex(item => item.key === activeProperty?.key)
        matches[index] = activeProperty
    }

    const onSetMatches = () => {
        if (searchValue.length > 0 ) {
            const filteredCustomers = allCustomers.filter(customer => {
                if(customer.cust_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
                customer.cust_phone?.toLowerCase().includes(searchValue.toLowerCase()) ||
                customer.service_address?.toLowerCase().includes(searchValue.toLowerCase())) return true
            })
            setMatches(filteredCustomers)
            let offRouteResults = [] 
            if (!activeRoute.name) {
                offRouteResults = [...filteredCustomers]
            } else {
                filteredCustomers.forEach(item => {
                    if (!activeRoute?.customers?.find(i => i.id === item.id)) {
                        offRouteResults.push(item)
                    }
                })
            }
            if ((filteredCustomers.length === 1)) {
                selectCustomer(filteredCustomers[0])
                // dispatch(setActiveItem(filteredCustomers[0], allCustomers, SET_ACTIVE_PROPERTY))
                // scrollCustomerIntoView(filteredCustomers[0])
            }
            dispatch(filterProperties(offRouteResults))
        } else {
            setMatches([])  
            dispatch(filterProperties([]))
        }
    }

    const changeSearchValue = (event) => setSearchValue(event.target.value)


    return (
        <div style={{position: "relative"}}>
            <FormControl size="sm" type="search" onClick={onSetMatches} onChange={changeSearchValue} placeholder="search" value={searchValue} />
            <ListGroup  style={listStyle} as="ul">
            {
                (matches.length > 0) ?
                matches.map(customer => (
                        <ListGroup.Item style={itemStyle} key={customer.id} action onClick={() => selectCustomer(customer)}>
                        {customer.cust_name} | {customer.service_address} | {customer.cust_phone}
                        </ListGroup.Item> 
                    )
                ) : null
            }
            </ListGroup>
        </div>
    )
}

export default SearchBar
