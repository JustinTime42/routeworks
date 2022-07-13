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
        this updates live - sends to server during onDrop
    otherProperties
        all properties except the current route properties

For state management, we'll use local state synced with firestore subscription like the dropdowns
*/


import React, {useState, useEffect} from 'react'
import { useDispatch, useSelector } from "react-redux";
import * as styles from './route-builder-styles'
import * as dnd from './drag-functions'
import {UPDATE_ADDRESSES_SUCCESS, GET_ROUTE_SUCCESS, SET_ACTIVE_ROUTE} from '../../constants'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { editItem, requestAllAddresses, filterRouteProperties, saveRoute, setActiveProperty, saveNewProperty, editProperty, deleteProperty, getRouteData, createItem, setTempItem } from "../../actions"


const RouteBuilder = () => {
    const modals = useSelector(state => state.whichModals.modals)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const activeCustomer = useSelector(state => state.setActiveProperty.activeProperty)
    //const allCustomers = useSelector(state => state.requestAllAddresses.addresses)
    const routeProperties = useSelector(state => state.getRouteProperties.addresses)
    const routeData = useSelector(state => state.getRouteData.routeData)
    const dispatch = useDispatch()

    const [offRouteList, setOffRouteList] = useState([])
    //const [allCustomers, setAllCustomers] = useState([])
    const [scrollPosition, setScrollPosition] = useState(0)
    const [searchField, setSearchField] = useState('')
    
    useEffect(() => {
        const unsub = onSnapshot(collection(db, `admin/admin_lists/customer`), (querySnapshot) => {
            dispatch({type: UPDATE_ADDRESSES_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
        })
        return () => {
            unsub()
        }
    },[])

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'route_data'), (querySnapshot) => {
            dispatch({type: GET_ROUTE_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
        })
        return () => {
            unsub()
        }
    },[])

    const onInitRoute = () => {
        dispatch(editItem(routeProperties.map(i => i.status = "Waiting"), [], 'route_data', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS)   )
        routeProperties.map(i => i.status === 'Waiting')
    }

    return (
        this.props.isAllPending || this.props.isRoutePending ?
        <h1></h1> :(
        <>
        <div style={{display: "flex", justifyContent: "space-around", margin: "3px"}}>
            {/* <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={this.refreshData}>Refresh Data</Button> */}
            <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={onInitRoute}>Initialize Route</Button>
            <Button variant="primary" size="sm" onClick={this.onNewPropertyClick}>New</Button>
        </div>
        <div className="adminGridContainer">
        <DragDropContext onDragEnd={dnd.onDragEnd}>
            <Droppable droppableId="droppable2">                    
                {(provided, snapshot) => (
                    <div
                        className="leftSide, scrollable"
                        id="droppable2scroll"
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}>
                        {routeProperties.map((item, index) => (
                            <Draggable
                                key={item.id}
                                draggableId={`L${item.id.toString()}`}
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
                                            route={this.props.activeRoute}
                                            key={item.key} 
                                            address={item} 
                                            admin={true} 
                                            detailsClick={this.onDetailsPropertyClick} 
                                            handleClick={this.handlePropertyClick}
                                            refreshData={this.refreshData}
                                            activeProperty={this.props.activeProperty}
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
                        {this.state.filteredItems.map((item, index) => (
                            <Draggable
                                key={item.key}
                                draggableId={`R${item.key.toString()}`}
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
                                            route={this.props.activeRoute} 
                                            key={item.key} 
                                            address={item} 
                                            admin={true} 
                                            detailsClick={this.onDetailsPropertyClick} 
                                            handleClick={this.handlePropertyClick}
                                            activeProperty={this.props.activeProperty}
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
            <CustomerEditor 
                activeProperty={this.props.activeProperty} 
                onSave={this.onPropertySave}
                show={this.state.showModal}
                close={this.onCloseClick}
                onDelete={this.onDelete}
            />
        </div>
        </>  
   ))    
}

export default RouteBuilder