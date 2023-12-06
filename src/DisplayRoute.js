import React, { useEffect, useState } from 'react' 
import { useDispatch, useSelector } from "react-redux"
import { useParams, Outlet } from 'react-router-dom'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from './firebase'
import PropertyCard from "./components/PropertyCard"
import { Alert } from 'react-bootstrap'
import { editItem, setActiveItem } from './actions'
import { GET_TRACTORS_SUCCESS, SET_ACTIVE_PROPERTY, SET_ACTIVE_ROUTE, SET_ACTIVE_TRACTOR } from './constants'
import './styles/driver.css'
import { isPropertyWithinTempDates } from './components/utils'

const useLocation = () => {
    const [location, setLocation] = useState(null);
  
    useEffect(() => {
        const location = null
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by your browser');
      } else {        
        const watchId = navigator.geolocation.watchPosition((position) => {
            console.log("updating position")
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        });
        return () => navigator.geolocation.clearWatch(watchId);
      }
    }, []);      
    return location;
}

const DisplayRoute= (props) => {    
    const [location, setLocation] = useState(null);
    const activeProperty = useSelector(state => state.setActiveProperty.activeProperty)
    const customers = useSelector(state => state.requestAllAddresses.addresses)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const vehicles = useSelector(state => state.getTractors.allTractors)
    const activeVehicle = useSelector(state => state.setActiveTractor.activeTractor)
    const routeCustomers = useSelector(state => {
        const routeCustomers = state.setActiveRoute.activeRoute?.customers
        const ids = Object.keys(routeCustomers || {})
        let customersArray = []
        ids.forEach(id => {
            if(routeCustomers[id].active === true) {
                if (isPropertyWithinTempDates(routeCustomers[id])) {
                    customersArray.push({...routeCustomers[id], id: id})
                }
            }
        })
        return customersArray.sort((a,b) => (b.routePosition < a.routePosition) ? 1 : -1)        
    })

    const routes = useSelector(state => state.requestRoutes.routes)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const activeTractor = useSelector(state => state.setActiveTractor.activeTractor)    
    const activeWorkType = useSelector(state => state.setActiveWorkType.workType)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const dispatch = useDispatch()
    // const location = useLocation();
    const { routeId, custId } = useParams()
      
    useEffect(() => {  
        console.log(routeId)
        dispatch(setActiveItem({}, customers, SET_ACTIVE_PROPERTY)) 
        const unsub = routeId ? 
            onSnapshot(doc(db, `organizations/${organization}/route/`, routeId), 
            (doc) => {
                dispatch(setActiveItem({...doc.data(), id: doc.id}, routes, SET_ACTIVE_ROUTE))                
                document.getElementById('droppable2scroll')?.scrollTo(0,0)
            }, 
            err =>alert(err)) : () => null
        return () => unsub()
    },[routeId, activeWorkType, activeTractor])

    // useEffect(() => {
    //     const moveThreshold = 0.0005;
    //     if (activeTractor.id && activeRoute.id && activeWorkType.id && navigator.geolocation) {
    //         const watchId = navigator.geolocation.watchPosition((position) => {
    //             console.log("checking position")
    //             const lat = position.coords.latitude
    //             const lng = position.coords.longitude                
    //             if (!location || (location && (
    //                 Math.abs(lat - location.lat) > moveThreshold ||
    //                 Math.abs(lng - location.lng) > moveThreshold))) 
    //             {
    //                 console.log("Updating position")
    //                 setLocation(location);                
    //                 const newVehicle = {
    //                     ...activeVehicle,
    //                     location: {
    //                         lat: lat,
    //                         lng: lng,
    //                         },
    //                     }
    //                 setLocation({
    //                     lat: lat,
    //                     lng: lat,
    //                 });
    //                 dispatch(editItem(newVehicle, vehicles, `organizations/${organization}/vehicle`, SET_ACTIVE_TRACTOR, GET_TRACTORS_SUCCESS))
    //             }
    //         });
    //         return () => navigator.geolocation.clearWatch(watchId);
    //     }
    //   }, [activeRoute.id, activeTractor.id, activeVehicle, activeWorkType.id, dispatch, organization, vehicles]);

    const changeActiveProperty = (property, direction = '') => {
        console.log(property)
        if (direction) {
            let currentPosition = routeCustomers.findIndex(i=> i.id === property.id) 
            const nextPosition = (direction === 'next') ? currentPosition + 1 : currentPosition - 1
            if (nextPosition >= 0 && nextPosition < routeCustomers.length) {           
                if ((nextPosition - 1) > 0) {
                    document.getElementById(`card${nextPosition - 1}`).scrollIntoView(true)
                } else {
                    document.getElementById(`card${nextPosition}`).scrollIntoView(true)
                }
                return routeCustomers[nextPosition].id
            }                      
        } else {
            return property.id
        }
    }

    return (
        activeTractor.id && activeWorkType.id && Object.keys(routeCustomers).length > 0 ?
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
                            changeActiveProperty={changeActiveProperty}                            
                        />  
                    )                                                                                      
                }) 
                }
            </div>
            <Outlet context={[changeActiveProperty]}/>
            {/* <PropertyDetails changeProperty={changeActiveProperty}/> */}
        </div> : <Alert variant="warning">Please select route, vehicle, and work type to begin.</Alert>  
    )
}

export default DisplayRoute