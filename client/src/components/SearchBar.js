import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormControl, ListGroup } from 'react-bootstrap'
import { setActiveProperty } from '../actions'

const SearchBar = () => {

    const [searchValue, setSearchValue] = useState('')
    const [matches, setMatches] = useState([])
    const allCustomers = useSelector(state => state.requestAllAddresses.addresses)
    const routeData = useSelector(state => state.getRouteData.routeData)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const dispatch = useDispatch()

    const selectCustomer = (customer) => {
        // Find out if the customer is on current route
        let isOnRoute = routeData.find(entry => (entry.property_key === customer.key) && (entry.route_name === activeRoute))
        console.log("isonroute", isOnRoute)
        let cardId = isOnRoute ? isOnRoute.route_position : customer.key
        let found = document.getElementById(`card${cardId}`)
        if (found) found.scrollIntoView(true)
        dispatch(setActiveProperty(customer))
        setMatches([])
    }

    const listStyle = {
        position: "absolute", 
       // height: "200px",
        overflow: "scroll",
        zIndex: "99",
        visibility: (matches.length > 0) ? "visible" : "hidden"
    }

    const itemStyle = {
        whiteSpace: "nowrap",
    }
   
    useEffect(() => {
        onSetMatches()
    }, [searchValue])

    const onSetMatches = () => {
        if (searchValue.length > 1 ) {
            setMatches(allCustomers.filter(customer => {
                if(customer.cust_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
                customer.address?.toLowerCase().includes(searchValue.toLowerCase()) ||
                customer.cust_phone?.includes(searchValue)) return true
            }))
        } else {
            setMatches([])
        }
    }

    const changeSearchValue = (event) => setSearchValue(event.target.value)


    return (
        <div style={{position: "relative"}}>
            <FormControl size="sm" type="text" onClick={onSetMatches} onChange={changeSearchValue} placeholder="search" value={searchValue} />
            <ListGroup style={listStyle} as="ul">
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
