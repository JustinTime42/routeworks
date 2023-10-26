import React, { useEffect} from 'react'
import { useDispatch, useSelector } from "react-redux"
import { collection, onSnapshot, doc, getDoc, Timestamp, updateDoc, deleteField, addDoc } from "firebase/firestore"
import { db, functions, httpsCallable } from '../firebase'
import { getItemStyle, getListStyle} from './route-builder-styles'
import { onDragEnd, removeExtraFields } from './drag-functions'
import {REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE, SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS,GET_VEHICLE_TYPES_SUCCESS, UPDATE_CUSTOMERS_SUCCESS} from '../constants'

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Button, Form } from 'react-bootstrap'
import PropertyCard from '../components/PropertyCard'
import { editItem, deleteItem, setActiveItem, createItem, setTempItem, showModal, hideModal } from "../actions"
import CustomerEditor from '../components/editor_panels/CustomerEditor'
import { getCollectionDocs, scrollCardIntoView } from '../components/utils'

import { scrollCardIntoView, getLatLng, getCollectionDocs, scrollCardIntoView } from '../components/utils'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
// import { migrateCustomers  } from './utils'
import { getCustFields, getLocationFields } from '../components/utils'
//import FileUpload from '../components/migration/FileUpload'

const RouteBuilder = () => {
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routes = useSelector(state => state.requestRoutes.routes)
    const activeCustomer = useSelector(state => state.setActiveProperty.activeProperty)
    const customers = useSelector(state => state.getAllCustomers.customers)
    const serviceLocations = useSelector(state => state.requestAllAddresses.addresses)    
    const filteredProperties = useSelector(state => state.filterProperties.customers)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const modals = useSelector(state => state.whichModals.modals)
    const { routeId, custId } = useParams()
    const navigate = useNavigate()

    const dispatch = useDispatch()

    useEffect(() => {        
        //const routeId = routes.find(i => i.name === routeName)?.id
        console.log(routeId)
        const unsub = routeId ? onSnapshot(doc(db, `organizations/${organization}/route/`, routeId), (doc) => {  
            console.log("Updating route")          
            dispatch(setActiveItem({...doc.data(), id: doc.id}, routes, SET_ACTIVE_ROUTE))
        }) : () => null
        return () => {
            unsub()
        }
    }, [routeId])

    useEffect(() => {
        let custIndex = activeRoute?.customers?.[activeCustomer?.id]?.routePosition
        scrollCardIntoView(custIndex)
    }, [activeCustomer])

    useEffect(() => {   
        console.log("customer param: ", custId)
        const newActiveCustomer = serviceLocations.find(i => i.id === custId)       
        if (newActiveCustomer === undefined) return 
        dispatch(setActiveItem(newActiveCustomer, serviceLocations, SET_ACTIVE_PROPERTY))
    }, [custId])

    const onInitRoute = () => {
        let confirmed = window.confirm(`Initialize ${activeRoute.name}?`)
        if (confirmed) {
            const newRouteCustomers = {...activeRoute.customers}
            Object.keys(newRouteCustomers).forEach(customer => {
                newRouteCustomers[customer].status = "Waiting"
            })
            dispatch(editItem({...activeRoute, customers: newRouteCustomers}, routes, `organizations/${organization}/route`, SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS)) 
        } else return
    }

    const onNewPropertyClick = () => {
        dispatch(showModal('Customer'))
        navigate('blank')
        let dateCreated = Timestamp.fromDate(new Date(Date.now()))
        dispatch(setTempItem({cust_name: '', routesAssigned: {}, contract_type: "Per Occurrence", sand_contract: "Per Visit", date_created: dateCreated}))
    }

    const onDetailsPropertyClick = async(location) => {        
        dispatch(showModal('Customer'))        
        const locationDetails = serviceLocations.find(i => i.id === location.id)
        const customerDetails = customers.find(i => i.id === locationDetails.cust_id)
        console.log({...locationDetails, ...customerDetails, loc_id: locationDetails.id})
        dispatch(setTempItem({...locationDetails, ...customerDetails, loc_id: locationDetails.id}))
    }

    const toggleField = (customer, route, field) => { 
        let newRoute = ({...route})
        newRoute.customers[customer.id][field] = !newRoute.customers[customer.id][field]
        dispatch(editItem(newRoute, routes, `organizations/${organization}/route`, SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
    }


    // this deletes the service location, not the customer

    const updateAllAddresses = () => {
        allCustomers.forEach(customer => {
            if (customer.service_address) {
                onPropertySave(customer)
            }
        })
    }

    const onDelete = (customer) => {
        if (Object.keys(customer.routesAssigned).length > 0) {
            alert("This service location is assigned to a route. Please remove them from all routes before deleting.")
            return
        }
        // this doesn't property renumber the route positions. fix that before re-enabling this feature
        // Object.values(customer.routesAssigned).forEach(route => {
        //     let newRoute = {...routes.find(i => i.name === route)}
        //     delete newRoute.customers[customer.id]
        //     dispatch(editItem(newRoute, routes, `organizations/${organization}/route`, null, REQUEST_ROUTES_SUCCESS))
        // })
        dispatch(deleteItem(getLocationFields(customer), serviceLocations, `organizations/${organization}/service_locations`, SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS))
        dispatch(hideModal('Customer'))
    }

    const dragEnd = async (result) => {
        const customersArray = []
        Object.keys(activeRoute.customers).forEach(id => {
            console.log(id)
            const routePosition = activeRoute.customers[id].routePosition
            customersArray[routePosition] = {...activeRoute.customers[id], id: id}
        })
        console.log(customersArray)
        const newLists = onDragEnd(result, customersArray, filteredProperties)
        if (!newLists) {
            console.log("no result")
            return
        } 
        console.log(newLists)
        let customer = {...serviceLocations.find(location => location.id === newLists.card.id)}
        if (!customer.routesAssigned || (!customer.routesAssigned)) {customer.routesAssigned = {}}
        if (newLists.whereTo === 'on') {
            console.log({...customer.routesAssigned})
            customer = {...customer, routesAssigned: {...customer.routesAssigned, [activeRoute.id]:activeRoute.name}}
            //customer.routesAssigned[activeRoute.id] = activeRoute.name
            console.log({...customer.routesAssigned})
        } else if (newLists.whereTo === 'off') {
            let confirmed = window.confirm(`Confirm removal of ${customer.cust_name} from ${activeRoute.name}`)
            if (confirmed) {
                console.log(customer)
                const routeRef = doc(db, `organizations/${organization}/route`, activeRoute.id);
                await updateDoc(routeRef, {
                    [`customers.${customer.id}`]: deleteField()
                });
                delete customer.routesAssigned[activeRoute.id]
            } else return
        }
        // then turn newLists.newRoute back into object
        const customersObject = {}
        newLists.newRoute.forEach((customer, i) => {
            const {id, ...customerObject} = customer 
            customersObject[customer.id] = {...customerObject, routePosition: i}
        })
        dispatch(editItem({
            id: activeRoute.id, 
            customers: {...customersObject}}, 
            routes, 
            `organizations/${organization}/route`, 
            SET_ACTIVE_ROUTE, 
            REQUEST_ROUTES_SUCCESS))
        console.log(customersObject)        
        dispatch(editItem(customer, serviceLocations, `organizations/${organization}/service_locations`, SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS, false))
        navigate(`/routebuilder/${activeRoute.id}`)
    }

    return (
        <>
        <div style={{display: "flex", justifyContent: "space-around", margin: "3px"}}>
            <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={onInitRoute}>Initialize Route</Button>
            <div>
            <Button style={{visibility: currentUser.claims.role === 'Admin' ? 'visible' : 'hidden'}} variant="primary" size="sm" onClick={onNewPropertyClick}>Create Customer</Button>
            </div>
<<<<<<< HEAD
=======
            {/* <Button onClick={() => migrateCustomers(organization)}>Migrate customers</Button> */}

  {/*<Button variant="primary" size="sm" style={{margin: "3px"}} onClick={updateAllAddresses}>Update All Addresses</Button> */}

>>>>>>> 8963371246d97180d9ecd0c58988cbdaf9004059
        </div>
        <div className="adminGridContainer">
            <DragDropContext onDragEnd={dragEnd}>            
                <Droppable droppableId="droppable2">                    
                    {(provided, snapshot) => (
                        <div
                            className="leftSide, scrollable"
                            id="droppable2scroll"
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}>
                            {(routeId !== "blank") && routeId && activeRoute.customers &&
                                Object.keys(activeRoute?.customers)?.sort((a,b) => (
                                (activeRoute.customers[b].routePosition < activeRoute.customers[a].routePosition) ? 1 : -1
                            ))
                            .map((id, index) => (
                                <Draggable
                                    isDragDisabled = {!activeRoute?.editableBy?.includes(currentUser.claims.role)}
                                    key={id}
                                    draggableId={id}
                                    index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            id={`${id}routecard`}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}    
                                            {...provided.dragHandleProps}
                                            style={getItemStyle(
                                                snapshot.isDragging,
                                                provided.draggableProps.style
                                            )}>
                                            <PropertyCard 
                                                i={index} 
                                                route={activeRoute}
                                                key={id}
                                                address={{...activeRoute.customers[id], id: id}} 
                                                admin={['Admin'].includes(currentUser.claims.role)} 
                                                detailsClick={onDetailsPropertyClick} 
                                                toggleField={toggleField}
                                                activeProperty={activeCustomer}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}                            
                        </div>
                    )}
                </Droppable>
                <Droppable className="rightSide" droppableId="droppable">
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            className="rightSide, scrollable"
                            style={getListStyle(snapshot.isDraggingOver)}>
                            {(filteredProperties.length === 0) ? <div>Start typing a customers name or address into the search box above to begin building your route.</div> :
                            filteredProperties.map((item, index) => (
                                <Draggable
                                    isDragDisabled = {!activeRoute?.editableBy?.includes(currentUser.claims.role)}
                                    key={item.id}
                                    draggableId={item.id}
                                    index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={getItemStyle(
                                                snapshot.isDragging,
                                                provided.draggableProps.style
                                            )}>
                                            <PropertyCard 
                                                i={index} 
                                                route={activeRoute}
                                                key={item.id} 
                                                address={item} 
                                                admin={['Admin'].includes(currentUser.claims.role)} 
                                                detailsClick={onDetailsPropertyClick}
                                                activeProperty={activeCustomer}
                                            />                  
                                        </div>
                                    )}
                                </Draggable>
                            ))} 
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            <Outlet context={[onDelete, customers]} />
        </div>
        </>
    )    
}

export default RouteBuilder