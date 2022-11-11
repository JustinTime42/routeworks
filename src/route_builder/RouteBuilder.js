import React, { useEffect} from 'react'
import { useDispatch, useSelector } from "react-redux"
import { collection, onSnapshot, doc, getDoc, Timestamp } from "firebase/firestore"
import { db } from '../firebase'
import { getItemStyle, getListStyle} from './route-builder-styles'
import { onDragEnd, removeExtraFields } from './drag-functions'
import {REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE, SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS,GET_VEHICLE_TYPES_SUCCESS} from '../constants'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Button } from 'react-bootstrap'
import PropertyCard from '../components/PropertyCard'
import { editItem, deleteItem, setActiveItem, createItem, setTempItem, showModal, hideModal } from "../actions"
import CustomerEditor from '../components/editor_panels/CustomerEditor'

const RouteBuilder = () => {
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routes = useSelector(state => state.requestRoutes.routes)
    const activeCustomer = useSelector(state => state.setActiveProperty.activeProperty)
    const allCustomers = useSelector(state => state.requestAllAddresses.addresses)
    const filteredProperties = useSelector(state => state.filterProperties.customers)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const dispatch = useDispatch()

    useEffect(() => {
        const unsub = activeRoute.id ? onSnapshot(doc(db, `driver/driver_lists/route/`, activeRoute.id), (doc) => {
            dispatch(setActiveItem({...doc.data(), id: doc.id}, routes, SET_ACTIVE_ROUTE))
        }) : () => null
        return () => {
            unsub()
        }
    },[activeRoute.id])

    useEffect(() => {
        const unsub = onSnapshot(collection(db, `driver/driver_lists/customer/`), (querySnapshot) => {
            dispatch({type: UPDATE_ADDRESSES_SUCCESS, payload: querySnapshot.docs.map((doc, i) => {
                if (i % 100 === 0) {
                    console.log(doc.data())
                }                
                return {...doc.data(), id: doc.id}
            } )})
        })
        return () => {
            unsub()
        }
    },[])

    useEffect(() => {
        const unsub = onSnapshot(collection(db, `driver/driver_lists/vehicle_type`), (querySnapshot) => {
            dispatch({type: GET_VEHICLE_TYPES_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
        })
        return () => {
            unsub()
        }
    },[])

    useEffect(() => {
        document.getElementById('droppable2scroll').scrollTo(0,0)
    }, [activeRoute.name])

    const onInitRoute = () => {
        if (window.confirm(`Initialized ${activeRoute.name}`)) {
            const newRouteCustomers = activeRoute.customers.map(i => ({...i, status: "Waiting"}))
            dispatch(editItem({...activeRoute, customers: newRouteCustomers}, routes, 'driver/driver_lists/route', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
        } else return        
    }

    const onNewPropertyClick = () => {
        dispatch(showModal('Customer'))
        let dateCreated = Timestamp.fromDate(new Date(Date.now()))
        dispatch(setTempItem({cust_name: '', routesAssigned: {}, contract_type: "Per Occurrence", sand_contract: "Per Visit", date_created: dateCreated}))
    }

    const onDetailsPropertyClick = async(customer) => {
        dispatch(showModal('Customer'))
        const docRef = doc(db, 'driver/driver_lists/customer', customer.id)
        const docSnap = await getDoc(docRef)
        if(docSnap.exists()) {
            dispatch(setTempItem({...docSnap.data(), id: docSnap.id}))
        } else {
            console.log(`${customer.name} not found in database`)
        }
    }

    const handlePropertyClick = (customer) => {
        dispatch(setActiveItem(customer, allCustomers, SET_ACTIVE_PROPERTY))
    }

    const toggleField = (customer, route, field) => { 
        let newRoute = ({...route})  
        const routeIndex = activeRoute.customers.findIndex(item => item.id === customer.id)
        newRoute.customers[routeIndex][field] = !newRoute.customers[routeIndex][field]
        dispatch(editItem(newRoute, routes, 'driver/driver_lists/route', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
    }

    const onPropertySave = (newDetails) => {
        if (allCustomers.some(i => (i.service_address === newDetails.service_address) && (i.id !== newDetails.id))) {
            alert('This address is assigned to another customer')
            return
        }
        // edit relevant details on each route assigned
        const removeFields = (item) => { 
            return (
                {
                    id: item.id,
                    cust_name: item.cust_name, 
                    service_address: item.service_address || '',
                    service_level: item.service_level || null,
                }
            )
        }
        const newTrimmedDetails = removeFields(newDetails)
        console.log(newDetails)
        Object.values(newDetails.routesAssigned).forEach(route => {
            let newRoute = {...routes.find(i => i.name === route)}
            let custIndex = newRoute.customers.findIndex(item => item.id === newDetails.id)
            console.log(newRoute.customers[custIndex])
            newRoute.customers[custIndex] = {...newRoute.customers[custIndex], ...newTrimmedDetails} 
            console.log(newRoute.customers[custIndex])
            dispatch(editItem(newRoute, routes, 'driver/driver_lists/route', null, REQUEST_ROUTES_SUCCESS))
        })
        if (newDetails.id) {
            dispatch(editItem(newDetails, allCustomers, 'driver/driver_lists/customer', SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS))
        } else {
            dispatch(createItem(newDetails, allCustomers, 'driver/driver_lists/customer', SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS))
        }
        onCloseClick()
    }

    const onDelete = (customer) => {
        Object.values(customer.routesAssigned).forEach(route => {
            let newRoute = {...routes.find(i => i.name === route)}
            newRoute.customers.splice(newRoute.customers.findIndex(item => item.id === customer.id), 1)
            dispatch(editItem(newRoute, routes, 'driver/driver_lists/route', null, REQUEST_ROUTES_SUCCESS))
        })
        dispatch(deleteItem(customer, allCustomers, 'driver/driver_lists/customer', SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS))
        dispatch(hideModal('Customer'))
    }

    const dragEnd = (result) => {
        const newLists = onDragEnd(result, activeRoute.customers, filteredProperties)
        if (!newLists) {
            console.log("no result")
            return
        } 
        let customer = {...allCustomers.find(customer => customer.id === newLists.card.id)}
        if (!customer.routesAssigned || (customer.routesAssigned === [])) {customer.routesAssigned = {}}
        if (newLists.whereTo === 'on') {
            console.log({...customer.routesAssigned})
            customer = {...customer, routesAssigned: {...customer.routesAssigned, [activeRoute.id]:activeRoute.name}}
            //customer.routesAssigned[activeRoute.id] = activeRoute.name
            console.log({...customer.routesAssigned})
        } else if (newLists.whereTo === 'off') {
            let confirmed = window.confirm(`Confirm removal of ${customer.cust_name} from ${activeRoute.name}`)
            if (confirmed) {
                delete customer.routesAssigned[activeRoute.id]
            } else return            
        }
        
        dispatch(editItem({...activeRoute, customers: newLists.newRoute}, routes, 'driver/driver_lists/route', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))        
        dispatch(editItem(customer, allCustomers, 'driver/driver_lists/customer', SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS, false))
    }

    const onCloseClick = () => {
        dispatch(setTempItem(null))
        dispatch(hideModal('Customer'))
    }

    return (
        <>
        <div style={{display: "flex", justifyContent: "space-around", margin: "3px"}}>
            <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={onInitRoute}>Initialize Route</Button>
            <Button style={{visibility: currentUser.claims.role === 'Admin' ? 'visible' : 'hidden'}} variant="primary" size="sm" onClick={onNewPropertyClick}>New</Button>
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
                        {activeRoute.customers?.map((item, index) => (
                            <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        id={`${item.id}routecard`}
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
                                            handleClick={handlePropertyClick}
                                            toggleField={toggleField}
                                            activeProperty={activeCustomer}
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))
                        }
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
                        {filteredProperties.map((item, index) => (
                            <Draggable
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
                                            handleClick={handlePropertyClick}
                                            activeProperty={activeCustomer}
                                        />                  
                                    </div>
                                )}
                            </Draggable>
                        ))
                        } 
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
            <CustomerEditor 
                activeProperty={activeCustomer} 
                onSave={onPropertySave}
                close={onCloseClick}
                onDelete={onDelete}
            />
        </div>
        </> 
   )    
}

export default RouteBuilder