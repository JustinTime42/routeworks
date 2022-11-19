import React, { useEffect } from 'react' 
import { useDispatch, useSelector } from "react-redux"
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from './firebase'
import PropertyCard from "./components/PropertyCard"
import PropertyDetails from "./components/PropertyDetails"
import { Alert } from 'react-bootstrap'
import { setActiveItem } from './actions'
import { SET_ACTIVE_PROPERTY, SET_ACTIVE_ROUTE } from './constants'

import './styles/driver.css'

const DisplayRoute= (props) => {
    const activeProperty = useSelector(state => state.setActiveProperty.activeProperty)
    const customers = useSelector(state => state.requestAllAddresses.addresses)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routes = useSelector(state => state.requestRoutes.routes)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const activeTractor = useSelector(state => state.setActiveTractor.activeTractor)    
    const activeWorkType = useSelector(state => state.setActiveWorkType.workType)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const dispatch = useDispatch()
      
    useEffect(() => {
        const unsub = activeRoute.id ? onSnapshot(doc(db, `organizations/${organization}/route/`, activeRoute.id), (doc) => {
            dispatch(setActiveItem({...doc.data(), id: doc.id}, routes, SET_ACTIVE_ROUTE))
        }) : () => null
        return () => {
            unsub()
        }
    },[activeRoute.id])

    const changeActiveProperty = (property = activeProperty, direction = '') => {
        const custDetails = (customer) => {
            return customers.find(i => i.id === customer.id)
        }
        console.log(property, direction)
        if (direction) {
            let currentPosition = activeRoute.customers.findIndex(i => i.id === property.id)
            console.log(currentPosition)
            let nextPosition = (direction === 'next') ? currentPosition + 1 : currentPosition - 1
            if (nextPosition >= 0 && nextPosition < activeRoute.customers.length) {
                dispatch(setActiveItem(custDetails(activeRoute.customers[nextPosition]), customers, SET_ACTIVE_PROPERTY))
                if ((nextPosition - 1) > 0) {
                    document.getElementById(`card${nextPosition - 1}`).scrollIntoView(true)
                } else {
                    document.getElementById(`card${nextPosition}`).scrollIntoView(true)
                }
            }
        } else {
            dispatch(setActiveItem(custDetails(property), customers, SET_ACTIVE_PROPERTY))
        }
    }

    return (
        activeTractor.id && activeWorkType.id ?
        <div className="driverGridContainer" style={{height: "90vh", overflow: "auto"}}>
            <div className="leftSide scrollable" style={{height: "100%", width:"100%"}}>
                {
                    activeRoute.customers.filter(customer => customer.active === true).map((address, i )=> {
                        return (
                            <PropertyCard                                                                    
                                i={i}  
                                route={activeRoute.name}                                   
                                key={address.id} 
                                address={address}
                                activeProperty={activeProperty}
                                handleClick={changeActiveProperty}                             
                            />  
                        )                                                                                      
                    }) 
                }
            </div>
            <PropertyDetails changeProperty={changeActiveProperty}/>
        </div> : <Alert variant="warning">Please select route, vehicle, and work type to begin.</Alert>  
    )
}

export default DisplayRoute