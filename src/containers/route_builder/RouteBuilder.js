/*
drag and drop
if source === dest & dest === route
    reorder route
else 
if dest === rightSide
    remove from route
else 
    add to route
    set status waiting


maintain two lists: 
    routeProperties
        all the properties currently on the route
        this updates live - sends to server during onDragEnd
    otherProperties
        all properties that fulfil the search except the current route properties
        *NOTE
            If the searchField has 0 results, search the routelist and scroll to result and activate

For state management, we'll use local state synced with firestore subscription like the dropdowns
*/

 /*
    Things removed from DragEnd
    onSave - maybe can be caught with a useEffect or can be re-added to onDragEnd by sending to db there
    checking if customer is already on route (should be unnecessary)
    setStates changed to return statements. will need to setState here, so I'll need to add some functionality here
    The right hand list just needs to be the customers that are returned by the searchfield and aren't on the route
    if the right hand list.length() === 0, search the left side and scroll to results

    new shape of routeData stored in firebase should be:

    so I could store the route_data like in heroku, then subscribe to the query: 
        I need a way to identify the properties in the route. 
    routeData: [{
        customer_id:
        routeName:
        route_position:
        Priority:
        active:
        status:        
    }]
    then we can subscribe to the query arrayContains(routeName:)

    Each customer can have an array: routes_assigned, and I can subscribe to the query customers where
    routes_assigned array-contains, 'routeName'
    We'd still need a route_data collection exactly like in postgress to store the rest of the relevant route data 
    and then merge that data into the customer data just like now
    actually maybe there should be a collection of routes - hey there already is!
    a document would look like this: 
    routeName: [

        or
        customer_id: {
            routeName:
            route_position:
            Priority:
            active:
            status:
        }
    ]

    or, in addition to the routes_assigned field, I could also have a an array of maps within the customer document. 
    Nope. separate document for the route makes more sense. If the route_data is stored in the customer document, then
    when a route gets re-ordered, we'll have to do a write on every customer document on that route, rather than 
    just on the route_data document

    /driver/driver_lists/route/[routeID] will be of the shape: 
    name:
    active: 
    customers: [
        {        
            customer_id:
            cust_name:
            service_address:
            contract_type
            service_level
            route_position: ? // or maybe just use the position in the array?
            Priority:
            active:
            status:
        },
    ]

    add routes_assigned to the customers table, and that will have to be written to when adding or removing a property?

    this will cap routes at 200 customers per route, but that should be plenty and will greatly reduce writes

    then, when driver hits done, it writes to this document and do the service log
    */ 
 
    

import React, {useState, useEffect} from 'react'
import { useDispatch, useSelector } from "react-redux"
import { collection, query, onSnapshot } from "firebase/firestore"
import {db } from '../../firebase'
import { getItemStyle, getListStyle} from './route-builder-styles'
import { onDragEnd } from './drag-functions'
import {REQUEST_ROUTES_SUCCESS, GET_ROUTE_SUCCESS, SET_ACTIVE_ROUTE, SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS} from '../../constants'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Button } from 'react-bootstrap'
import PropertyCard from '../../components/PropertyCard'
import { editItem, deleteItem, requestAllAddresses, filterRouteProperties, saveRoute, setActiveItem, saveNewProperty, editProperty, deleteProperty, getRouteData, createItem, setTempItem, showModal, hideModal } from "../../actions"
import CustomerEditor from '../../components/editor_panels/CustomerEditor'

const RouteBuilder = () => {
    const modals = useSelector(state => state.whichModals.modals)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routes = useSelector(state => state.requestRoutes.routes)
    const activeCustomer = useSelector(state => state.setActiveProperty.activeProperty)
    const allCustomers = useSelector(state => state.requestAllAddresses.addresses)
    const filteredProperties = useSelector(state => state.filterProperties.customers)
   // const routeProperties = useSelector(state => state.getRouteProperties.addresses)
    const routeData = useSelector(state => state.getRouteData.routeData)
    const dispatch = useDispatch()

    const [offRouteList, setOffRouteList] = useState([])
    //const [allCustomers, setAllCustomers] = useState([])
    const [scrollPosition, setScrollPosition] = useState(0)
    const [searchField, setSearchField] = useState('')   


    useEffect(() => {
        console.log(filteredProperties)
        const unsub = onSnapshot(collection(db, 'route_data'), (querySnapshot) => {
            dispatch({type: GET_ROUTE_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
        })
        return () => {
            unsub()
        }
    },[])

    const onInitRoute = () => {
        dispatch(editItem(activeRoute.customers.map(i => i.status = "Waiting"), routes, 'route_data', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
    }

    const onNewPropertyClick = () => {
        dispatch(setTempItem({}))
    }

    const onDetailsPropertyClick = (customer) => {
        dispatch(showModal('Customer'))
        dispatch(setTempItem({...customer}))
    }

    const handlePropertyClick = (customer) => {
        dispatch(setActiveItem(customer, allCustomers, SET_ACTIVE_PROPERTY))
    }

    const toggleActive = (customer, route) => { 
        let newRoute = ({...route})      
        const routeIndex =  activeRoute.customers.findIndex(item => item.id = customer.id)
        newRoute[routeIndex].active = !newRoute[routeIndex].active
        dispatch(editItem(newRoute, routes, 'route_data', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
    }

    const onPropertySave = (newDetails) => {
        //make sure newDetails includes ID
        if (newDetails.id) {
            dispatch(editItem(newDetails, allCustomers, 'driver/driver_lists/customer', SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS))
        } else {
            dispatch(createItem(newDetails, allCustomers, 'driver/driver_lists/customer', SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS))
        }
        dispatch(hideModal('Customer'))
        // check if the below is really necessary
        // setScrollPosition(document.getElementById('droppable2scroll').scrollTop)
    }

    const onDelete = (customer) => {
        dispatch(deleteItem(customer, allCustomers, 'driver/driver_lists/customer', SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS))
    }

    const onCloseClick = () => {
        dispatch(hideModal('Customer'))
    }


    return (
        !activeRoute.customers ?
        <h1></h1> :(
        <>
        <div style={{display: "flex", justifyContent: "space-around", margin: "3px"}}>
            {/* <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={this.refreshData}>Refresh Data</Button> */}
            <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={onInitRoute}>Initialize Route</Button>
            <Button variant="primary" size="sm" onClick={onNewPropertyClick}>New</Button>
        </div>
        <div className="adminGridContainer">
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable2">                    
                {(provided, snapshot) => (
                    <div
                        className="leftSide, scrollable"
                        id="droppable2scroll"
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}>
                        {activeRoute.customers.map((item, index) => (
                            <Draggable
                                key={item.id}
                                draggableId={item.id.toString()}
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
                        {filteredProperties.map((item, index) => {
                            if (!activeRoute.customers.includes(i => item.id === i.id)) {
                                return (
                                    <Draggable
                                        key={item.id}
                                        draggableId={`R${item.id.toString()}`}
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
                                )
                            } else return null
                            })
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
   ))    
}

export default RouteBuilder