import React, { useEffect} from 'react'
import { useDispatch, useSelector } from "react-redux"
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore"
import {db } from '../../firebase'
import { getItemStyle, getListStyle} from './route-builder-styles'
import { onDragEnd, removeExtraFields } from './drag-functions'
import {REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE, SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS,GET_VEHICLE_TYPES_SUCCESS} from '../../constants'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Button } from 'react-bootstrap'
import PropertyCard from '../../components/PropertyCard'
import { editItem, deleteItem, setActiveItem, createItem, setTempItem, showModal, hideModal } from "../../actions"
import CustomerEditor from '../../components/editor_panels/CustomerEditor'

const RouteBuilder = () => {
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routes = useSelector(state => state.requestRoutes.routes)
    const activeCustomer = useSelector(state => state.setActiveProperty.activeProperty)
    const allCustomers = useSelector(state => state.requestAllAddresses.addresses)
    const filteredProperties = useSelector(state => state.filterProperties.customers)
    const dispatch = useDispatch()

    useEffect(() => {
        const unsub = onSnapshot(doc(db, `driver/driver_lists/route/`, activeRoute.id), (doc) => {
            dispatch(setActiveItem({...doc.data(), id: doc.id}, routes, SET_ACTIVE_ROUTE))
        })
        return () => {
            unsub()
        }
    },[])

    useEffect(() => {         
        const unsub = onSnapshot(collection(db, `driver/driver_lists/customer/`), (querySnapshot) => {
            dispatch({type: UPDATE_ADDRESSES_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
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
        const newRouteCustomers = activeRoute.customers.map(i => ({...i, status: "Waiting"}))
        dispatch(editItem({...activeRoute, customers: newRouteCustomers}, routes, 'driver/driver_lists/route', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
    }

    const onNewPropertyClick = () => {
        dispatch(showModal('Customer'))
        dispatch(setTempItem({cust_name: '', routesAssigned: []}))
    }

    const onDetailsPropertyClick = async(customer) => {
        dispatch(showModal('Customer'))
        
        // here we need to get the full details from the customer collection and set that as tempItem
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

    const toggleActive = (customer, route) => { 
        let newRoute = ({...route})  
        console.log(customer)
        console.log(newRoute)
        const routeIndex = activeRoute.customers.findIndex(item => item.id === customer.id)
        console.log(newRoute.customers[routeIndex])
        newRoute.customers[routeIndex].active = !newRoute.customers[routeIndex].active
        dispatch(editItem(newRoute, routes, 'driver/driver_lists/route', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
    }

    const onPropertySave = (newDetails) => {
        // edit relevant details on each route assigned
        const newTrimmedDetails = removeExtraFields(newDetails)
        newDetails.routesAssigned.forEach(route => {
            let newRoute = {...routes.find(i => i.name === route)}
            newRoute.customers[newRoute.customers.findIndex(item => item.id === newDetails.id)] = newTrimmedDetails
            dispatch(editItem(newRoute, routes, 'driver/driver_lists/route', null, REQUEST_ROUTES_SUCCESS))
        })
        //make sure newDetails includes ID
        if (newDetails.id) {
            dispatch(editItem(newDetails, allCustomers, 'driver/driver_lists/customer', SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS))
        } else {
            dispatch(createItem(newDetails, allCustomers, 'driver/driver_lists/customer', SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS))
        }
        dispatch(hideModal('Customer'))
    }

    const onDelete = (customer) => {
        customer.routesAssigned.forEach(route => {
            let newRoute = {...routes.find(i => i.name === route)}
            newRoute.customers.splice(newRoute.customers.findIndex(item => item.id === customer.id), 1)
            dispatch(editItem(newRoute, routes, 'driver/driver_lists/route', null, REQUEST_ROUTES_SUCCESS))
        })
        dispatch(deleteItem(customer, allCustomers, 'driver/driver_lists/customer', SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS))
        dispatch(hideModal('Customer'))
    }

    const dragEnd = (result) => {
        const newLists = onDragEnd(result, activeRoute.customers, filteredProperties)
        const customer = allCustomers.find(customer => customer.id === newLists.card.id)
        if (!customer.routesAssigned) {customer.routesAssigned = []}
        if (newLists.whereTo === 'on') {
            customer.routesAssigned.push(activeRoute.name)
        } else if (newLists.whereTo === 'off') {
            customer.routesAssigned.splice(customer.routesAssigned.indexOf(activeRoute.name), 1)
        }
        dispatch(editItem({...activeRoute, customers: newLists.newRoute}, routes, 'driver/driver_lists/route', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))        
        dispatch(editItem(customer, allCustomers, 'driver/driver_lists/customer', SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS))
    }

    const onCloseClick = () => {
        dispatch(hideModal('Customer'))
    }

    return (
        activeRoute.name ? 
        <>
        <div style={{display: "flex", justifyContent: "space-around", margin: "3px"}}>
            {/* <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={this.refreshData}>Refresh Data</Button> */}
            <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={onInitRoute}>Initialize Route</Button>
            <Button variant="primary" size="sm" onClick={onNewPropertyClick}>New</Button>
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
                                            admin={true} 
                                            detailsClick={onDetailsPropertyClick} 
                                            handleClick={handlePropertyClick}
                                            toggleActive={toggleActive}
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
                                            admin={true} 
                                            detailsClick={onDetailsPropertyClick} 
                                            handleClick={handlePropertyClick}
                                            toggleActive={toggleActive}
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
        </>  :null
   )    
}

export default RouteBuilder