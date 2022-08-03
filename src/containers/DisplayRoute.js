import React, { useState, useEffect } from 'react' 
import { useDispatch, useSelector } from "react-redux";
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import PropertyCard from "../components/PropertyCard"
import PropertyDetails from "../components/PropertyDetails"
import { setActiveProperty, getRouteProperties, setActiveItem } from '../actions'
import { SET_ACTIVE_PROPERTY, SET_ACTIVE_ROUTE } from '../constants'

import '../styles/driver.css'

const DisplayRoute= (props) => {
    const activeProperty = useSelector(state => state.setActiveProperty.activeProperty)
    const customers = useSelector(state => state.requestAllAddresses.addresses)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routes = useSelector(state => state.requestRoutes.routes)
    const driver = useSelector(state => state.setActiveDriver.name)
    const dispatch = useDispatch()
      
    useEffect(() => {
        const unsub = onSnapshot(doc(db, `driver/driver_lists/route/`, activeRoute.id), (doc) => {
            dispatch(setActiveItem({...doc.data(), id: doc.id}, routes, SET_ACTIVE_ROUTE))
        })
        return () => {
            unsub()
        }
    },[])

    const changeActiveProperty = (property = activeProperty, direction = '') => {
        console.log(property, direction)
        if (direction) {
            let currentPosition = activeRoute.customers.findIndex(i => i.key === property.key)
            console.log(currentPosition)
            let nextPosition = (direction === 'next') ? currentPosition + 1 : currentPosition - 1
                console.log(nextPosition)
            if (nextPosition >= 0 && nextPosition < activeRoute.customers.length) {
                dispatch(setActiveItem(activeRoute.customers[nextPosition], customers, SET_ACTIVE_PROPERTY))
                if ((nextPosition - 1) > 0) {
                    document.getElementById(`card${nextPosition - 1}`).scrollIntoView(true)
                } else {
                    document.getElementById(`card${nextPosition}`).scrollIntoView(true)
                }
            }
        } else {
            dispatch(setActiveItem(property, customers, SET_ACTIVE_PROPERTY))
        }
    }
            
    return (
        <div className="driverGridContainer" style={{height: "90vh", overflow: "auto"}}>
            <div className="leftSide scrollable" style={{height: "100%", width:"100%"}}>
                {
                    activeRoute.customers.map((address, i )=> {
                        if (address.active){
                            return (
                                <PropertyCard                                                                    
                                    i={i}  
                                    route={activeRoute.name}                                   
                                    key={address.key} 
                                    address={address}
                                    activeProperty={activeProperty}
                                    handleClick={changeActiveProperty}                             
                                />  
                            )   
                        }  else return null                                                                                    
                    }) 
                }
            </div>
            <PropertyDetails property={activeProperty} changeProperty={changeActiveProperty}/>
        </div>  
    )
}

export default DisplayRoute