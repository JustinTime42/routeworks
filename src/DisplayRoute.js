import React, { useEffect } from 'react' 
import { useDispatch, useSelector } from "react-redux"
import { useParams, useNavigate, Outlet } from 'react-router-dom'
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
    const routeCustomers = useSelector(state => state.setActiveRoute.activeRoute.customers.filter(customer => customer.active === true))
    const routes = useSelector(state => state.requestRoutes.routes)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const activeTractor = useSelector(state => state.setActiveTractor.activeTractor)    
    const activeWorkType = useSelector(state => state.setActiveWorkType.workType)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const dispatch = useDispatch()
    const { routeName, custId } = useParams()
    const navigate = useNavigate()
      
    useEffect(() => {
        const routeId = routes.find(i => i.name === routeName)?.id
        const unsub = routeId ? 
            onSnapshot(doc(db, `organizations/${organization}/route/`, routeId), 
            (doc) => {
                dispatch(setActiveItem({...doc.data(), id: doc.id}, routes, SET_ACTIVE_ROUTE))
                dispatch(setActiveItem({}, customers, SET_ACTIVE_PROPERTY))
                document.getElementById('droppable2scroll')?.scrollTo(0,0)
            }, 
            err =>alert(err)) : () => null
        return () => unsub()
    },[routeName, activeWorkType, activeTractor])

    return (
        activeTractor.id && activeWorkType.id && (routeCustomers.length > 0) ?
        <div className="driverGridContainer" style={{height: "90vh", overflow: "auto"}}>
            <div className="leftSide scrollable" style={{height: "100%", width:"100%"}}>
                {
                routeCustomers.map((address, i )=> {
                    return (
                        <PropertyCard                                                                
                            i={i}  
                            route={activeRoute.name}                                   
                            key={address.id} 
                            address={address}
                            activeProperty={activeProperty}                             
                        />  
                    )                                                                                      
                }) 
                }
            </div>
            <Outlet />
            {/* <PropertyDetails changeProperty={changeActiveProperty}/> */}
        </div> : <Alert variant="warning">Please select route, vehicle, and work type to begin.</Alert>  
    )
}

export default DisplayRoute