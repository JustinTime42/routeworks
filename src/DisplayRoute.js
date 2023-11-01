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

const useLocation = () => {
    const [location, setLocation] = useState(null);
  
    useEffect(() => {
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by your browser');
      } else {
        const watchId = navigator.geolocation.watchPosition((position) => {
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
    const [lastLocation, setLastLocation] = useState(null);
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
                const offset = new Date().getTimezoneOffset() * 60000
                const start = routeCustomers[id].tempRange?.start ? (routeCustomers[id].tempRange?.start?.toDate())?.getTime() + offset : ""
                const end = routeCustomers[id].tempRange?.end ? (routeCustomers[id].tempRange?.end?.toDate())?.getTime() + offset + 86400000 : ""
                const now = new Date(Date.now())
                if (start && end && (start <= now) && (end >= now)) {
                    customersArray.push({...routeCustomers[id], id: id})
                } 
                else if (!end && (start <= now)) {
                    customersArray.push({...routeCustomers[id], id: id})
                }
                else if (!start && (end >= now)) {
                    customersArray.push({...routeCustomers[id], id: id})
                }
                else if (!routeCustomers[id].tempRange) {
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
    const location = useLocation();
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

    useEffect(() => {
        if (activeTractor.id && activeRoute.id && activeWorkType.id) {
            const moveThreshold = 0.0005;      
        
            if (location && (!lastLocation ||
                Math.abs(location.lat - lastLocation.lat) > moveThreshold ||
                Math.abs(location.lng - lastLocation.lng) > moveThreshold)) {
            setLastLocation(location);
        
            const newVehicle = {
                ...activeVehicle,
                location: {
                    lat: location.lat,
                    lng: location.lng,
                    },
                }
            dispatch(editItem(newVehicle, vehicles, `organizations/${currentUser?.claims?.organization}/vehicle`, SET_ACTIVE_TRACTOR, GET_TRACTORS_SUCCESS))
            }
        }
      }, [location]);

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