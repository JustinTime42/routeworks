import React, {useState, useEffect} from 'react'
import { useDispatch, useSelector } from "react-redux"
import { collection, onSnapshot, doc, getDoc, where } from "firebase/firestore"
import {db } from '../../firebase'
import { getItemStyle, getListStyle} from './route-builder-styles'
import { onDragEnd } from './drag-functions'
import {REQUEST_ROUTES_SUCCESS, GET_ROUTE_SUCCESS, SET_ACTIVE_ROUTE, SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS} from '../../constants'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Button } from 'react-bootstrap'
import PropertyCard from '../../components/PropertyCard'
import { editItem, deleteItem, requestAllAddresses, filterRouteProperties, saveRoute, setActiveItem, saveNewProperty, editProperty, deleteProperty, getRouteData, createItem, setTempItem, showModal, hideModal, filterProperties } from "../../actions"
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

    const [offRouteList, setOffRouteList] = useState(filteredProperties.filter(item => !activeRoute.customers.includes(i => i.id === item.id)))
    //const [allCustomers, setAllCustomers] = useState([])
    const [scrollPosition, setScrollPosition] = useState(0)
    const [searchField, setSearchField] = useState('')   

    useEffect(() => {
        const unsub = onSnapshot(doc(db, `driver/driver_lists/route/`, activeRoute.id), (doc) => {
            console.log(doc.data())
            dispatch(setActiveItem({...doc.data(), id: doc.id}, routes, SET_ACTIVE_ROUTE))
            //dispatch(editItem(doc.data(), routes, 'route_data', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
        })
        return () => {
            unsub()
        }
    },[])

    useEffect(() => {
        setOffRouteList(filteredProperties)
    },[filteredProperties])

    const onInitRoute = () => {
        dispatch(editItem(activeRoute.customers.map(i => i.status = "Waiting"), routes, 'route_data', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
    }

    const onNewPropertyClick = () => {
        dispatch(showModal('Customer'))
        dispatch(setTempItem({}))
    }

    const onDetailsPropertyClick = async(customer) => {
        dispatch(showModal('Customer'))
        console.log(customer.id)
            // here we need to get the full details from the customer collection and set that as tempItem
        const docRef = doc(db, 'driver/driver_lists/customer', customer.id)
        const docSnap = await getDoc(docRef)

        if(docSnap.exists()) {
            console.log(docSnap.data())
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
        dispatch(hideModal('Customer'))
    }

    const dragEnd = (result) => {
        const newLists = onDragEnd(result, activeRoute.customers, offRouteList)
        console.log(newLists.newRoute)
        const customer = allCustomers.find(customer => customer.id === newLists.card.id)
        console.log(customer)
        if (!customer.routesAssigned) {customer.routesAssigned = []}
        if (newLists.whereTo === 'on') {
            console.log(`adding ${activeRoute.name} to routesAssigned`)
            customer.routesAssigned.push(activeRoute.name)
        } else if (newLists.whereTo === 'off') {
            console.log(`removing ${activeRoute.name} from routesAssigned`)
            customer.routesAssigned.splice(customer.routesAssigned.indexOf(activeRoute.name), 1)
        }
        dispatch(editItem({...activeRoute, customers: newLists.newRoute}, routes, 'driver/driver_lists/route', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))        
        dispatch(editItem(customer, allCustomers, 'driver/driver_lists/customer', SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS))
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
        <DragDropContext onDragEnd={dragEnd}>
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
                        {offRouteList.map((item, index) => (
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
        </>  
   ))    
}

export default RouteBuilder