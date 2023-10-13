import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FormControl, ListGroup } from 'react-bootstrap'
import { setActiveItem, filterProperties } from '../actions'
import { SET_ACTIVE_PROPERTY } from '../constants'
import { scrollCardIntoView } from '../components/utils'

const SearchBar = () => {

    const [searchValue, setSearchValue] = useState('')
    const [matches, setMatches] = useState([])
    const allCustomers = useSelector(state => state.requestAllAddresses.addresses)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const dispatch = useDispatch()
    const location = useLocation()
    const navigate = useNavigate()
    const { routeId } = useParams()

    useEffect(() => {
        onSetMatches()
    }, [searchValue, allCustomers]) 

    useEffect(() => {
        if (!location.pathname.startsWith('/routebuilder')) {
            setSearchValue('')
        } 
        if (matches !== '') {
            onSetMatches()
        }        
    }, [activeRoute])

    const selectCustomer = (customer) => {
        // Find out if the customer is on current route        
        let isOnRoute = activeRoute?.customers?.[customer.id]
              
        if (isOnRoute) {
            scrollCustomerIntoView(customer)
        } else if (location.pathname.startsWith('/displayRoute')) {
            navigate(`${routeId}/${customer.id}`)
        }
        dispatch(setActiveItem(customer, allCustomers, SET_ACTIVE_PROPERTY))
        setMatches([])
    }

    const scrollCustomerIntoView = (customer) => {
        console.log(customer)
        let custIndex
        if(location.pathname === '/routebuilder') {
            custIndex = activeRoute.customers[customer.id]
        } else {
            custIndex = activeRoute.customers[customer.id]
        }     
        scrollCardIntoView(custIndex)           
    }

    const listStyle = {
        position: "absolute", 
        overflow: "scroll",
        zIndex: "99",
        visibility: ((matches.length > 0) && !(location.pathname.startsWith('/routebuilder'))) ? "visible" : "hidden"
    }

    const itemStyle = {
        whiteSpace: "nowrap",
    }

    const onSetMatches = () => {
        if (searchValue.length > 0 ) {
            const filteredCustomers = allCustomers.filter(customer => {
                if(customer.cust_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
                customer.cust_phone?.toLowerCase().includes(searchValue.toLowerCase()) ||
                customer.service_address?.toLowerCase().includes(searchValue.toLowerCase())) return true
                else return false
            })
            setMatches(filteredCustomers)
            let offRouteResults = [] 
            if (!activeRoute.name) {
                offRouteResults = [...filteredCustomers]
            } else {
                filteredCustomers.forEach(item => {
                    if (!activeRoute?.customers?.[item.id]) {
                        offRouteResults.push(item)
                    }
                })
            }
            if ((filteredCustomers.length === 1)) {
                selectCustomer(filteredCustomers[0])
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
