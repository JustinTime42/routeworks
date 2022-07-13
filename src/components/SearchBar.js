import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormControl, ListGroup } from 'react-bootstrap'
import { setActiveProperty, filterProperties } from '../actions'

const SearchBar = () => {

    const [searchValue, setSearchValue] = useState('')
    const [matches, setMatches] = useState([])
    const isAdmin = useSelector(state => state.showRouteEditor.showEditor)
    const allCustomers = useSelector(state => state.requestAllAddresses.addresses)
    const routeData = useSelector(state => state.getRouteData.routeData)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const activeProperty = useSelector(state => state.setActiveProperty.activeProperty)
    const dispatch = useDispatch()

    const selectCustomer = (customer) => {
        // Find out if the customer is on current route
        let isOnRoute = routeData.find(entry => (entry.property_key === customer.key) && (entry.route_name === activeRoute.name))
        console.log("isonroute", isOnRoute)
        let cardId = isOnRoute ? isOnRoute.route_position : customer.key
        let found = document.getElementById(`card${cardId}`)
        if (found) found.scrollIntoView(true)
        dispatch(setActiveProperty(customer))
        setMatches([])
        setSearchValue('')
    }

    const listStyle = {
        position: "absolute", 
       // height: "200px",
        overflow: "scroll",
        zIndex: "99",
        visibility: ((matches.length > 0) && !isAdmin) ? "visible" : "hidden"
    }

    const itemStyle = {
        whiteSpace: "nowrap",
    }
   
    useEffect(() => {
        onSetMatches()
    }, [searchValue, allCustomers]) // activeProperty?.key so it doesn't refresh the whole list for every key press. 
                                        // trouble is, that makes it also not update after saving

    useEffect(() => {
        updateMatches()
    }, [activeProperty])

    const updateMatches = () => {
        let index = matches.findIndex(item => item.key === activeProperty?.key)
        matches[index] = activeProperty
    }

    const onSetMatches = () => {
        if (searchValue.length > 1 ) {
            const filteredCustomers = allCustomers.filter(customer => {
                if(customer.cust_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
                customer.address?.toLowerCase().includes(searchValue.toLowerCase()) ||
                customer.cust_phone?.includes(searchValue)) return true
            })
            setMatches(filteredCustomers)
            dispatch(filterProperties(filteredCustomers))
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
                matches.map(customer => (
                        <ListGroup.Item style={itemStyle} key={customer.key} action onClick={() => selectCustomer(customer)}>
                        {customer.cust_name} | {customer.address} | {customer.cust_phone}
                        </ListGroup.Item> 
                    )
                )
            }
            </ListGroup>
        </div>
    )
}

export default SearchBar
