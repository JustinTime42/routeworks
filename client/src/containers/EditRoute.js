import React, { Component } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { connect } from "react-redux"
import { requestAllAddresses, getRouteProperties, filterRouteProperties, saveRoute, setActiveProperty, saveNewProperty, editProperty, deleteProperty, getRouteData } from "../actions"
import Button from 'react-bootstrap/Button'
import axios from "axios"
import PropertyCard from "../components/PropertyCard"
import CustomerDetails from "../components/CustomerEditor"
import '../styles/driver.css'

const mapStateToProps = state => {
    return {
        activeProperty: state.setActiveProperty.activeProperty,
        activeRoute: state.setActiveRoute.activeRoute,
        addresses: state.requestAllAddresses.addresses,
        isAllPending: state.requestAllAddresses.isPending,
        error: state.requestAllAddresses.error,
        routeData: state.getRouteData.routeData,
        isRoutePending: state.getRouteData.isPending,
        filterProperties: state.filterProperties.customers,
    }
} 

const mapDispatchToProps = (dispatch) => {
    return {    
        onSaveRoute: (route) => dispatch(saveRoute(route)),
        onGetAllAddresses: () => dispatch(requestAllAddresses()),
        onSetActiveProperty: (property) => dispatch(setActiveProperty(property)),
        onSaveNewProperty: (property, allAddresses) => dispatch(saveNewProperty(property, allAddresses)),
        onEditProperty: (property, allAddresses) => dispatch(editProperty(property, allAddresses)),
        onDeleteProperty: (property, allAddresses, routeName) => dispatch(deleteProperty(property, allAddresses, routeName)),
        onFilterRouteProperties: (addresses, route) => dispatch(filterRouteProperties(addresses, route)),
        getRouteData: () => dispatch(getRouteData()),
    }
}

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
}

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);
    destClone.splice(droppableDestination.index, 0, removed);
    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;
    return result;
};

const grid = 2;

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'Waiting',
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? '#4E8098' : '#303030',

    // styles we need to apply on draggables
    ...draggableStyle
});

const getListStyle = isDraggingOver => ({   
    padding: grid,
    height: "85vh", 
    overflow: "scroll", 
    width: "90%"
});

class EditRoute extends Component {
    constructor(props){
        super(props)
        this.state = { 
            items: [],
            filteredItems: this.props.filterProperties,
            selected: [],
            searchField: '',
            routeSearchField: '',
            showModal: false,
            activeProperty: this.props.activeProperty,      
            modified: [],   
            scrollPosition: 0,
        }
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {        
        return prevState.scrollPosition       
     }
    
    componentDidMount() {
        this.props.onGetAllAddresses()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {    
        if(this.props.isRoutePending !== prevProps.isRoutePending || this.props.isAllPending !== prevProps.isAllPending || prevProps.activeRoute !== this.props.activeRoute || this.props.addresses !== prevProps.addresses) {
            this.setSelected()
            this.setState((prevState, prevProps) => {
                return {
                    activeProperty: prevProps.activeProperty
                }
            }, () => {
                if(this.props.activeProperty?.routeName === this.props.activeRoute) {
                    let currentPosition = this.props.activeProperty.route_position - 1
                    console.log("currentposition", currentPosition)  
                    if (document.getElementById(`card${currentPosition}`)) {
                        document.getElementById(`card${currentPosition}`).scrollIntoView(true)
                    }                    
                }   
            })
        } 
        if(this.props.filterProperties !== prevProps.filterProperties) {
            this.setState({filteredItems: this.props.filterProperties})
        }
        // if(this.state.searchField !== prevState.searchField) {
        //     this.setState((prevState, prevProps) => ({filteredItems: this.onFilterProperties(prevState.searchField, prevProps.addresses)}))

        // }
        if (snapshot && document.getElementById('droppable2scroll')) {
            document.getElementById('droppable2scroll').scrollTop = snapshot
        }
    }

    id2List = {
        droppable: 'filteredItems',
        droppable2: 'selected'
    }

    setSelected = () => {     
        console.log("running setSelected()")   
        let selected = []
        let customers = [...this.props.addresses]
        let route = this.props.activeRoute
        this.props.routeData.forEach(routeEntry => {
            if (routeEntry.route_name === route) {
                let i = customers.findIndex(customer => customer.key === routeEntry.property_key)
                let customer = customers[i]                
                selected.push({...customer, routeName: routeEntry.route_name, route_position: routeEntry.route_position, status: routeEntry.status})
                customers[i].routeName = route
            }
        })
        let sortedSelect = selected.sort((a, b) => a.route_position > b.route_position ? 1 : -1) 
        console.log(sortedSelect)
       //let unselected = customers.filter(customer => customer.routeName !== route)
        this.setState({selected: sortedSelect })  
    }
    
    onSave = (customers, droppedCard = null, whereTo = 'same') => {
        this.setState({scrollPosition: document.getElementById('droppable2scroll').scrollTop})
        let selected = customers.map(item => {
            return (
                {key: item.key, route_position: item.route_position}
            )
        })
        console.log("selected", selected)
        axios.post(`${process.env.REACT_APP_API_URL}/saveroute`, 
            {
                route: this.props.activeRoute,
                selected: selected,
                droppedCard: {property_key: droppedCard?.key, route_position: droppedCard?.route_position, status: droppedCard?.status},
                whereTo: whereTo
            }
        )
        .then(res => {
           // this.props.onGetAllAddresses()           
            this.props.getRouteData()
            this.setSelected()
            console.log(res.data)                      
        })
        .catch(err => alert(err)) 
    }

    onInitRoute = () => {    
        let selected = [...this.state.selected]
        selected.forEach(customer => customer.status = "Waiting")
        console.log("selected ", selected)
        axios.post(`${process.env.REACT_APP_API_URL}/initroute`,
            {
                route: this.props.activeRoute,
                customers: selected      
            }
        )
        .then(res => {
            this.props.onGetAllAddresses()
            this.props.getRouteData()
            console.log(res.data)
        })
    }
    
    getList = id => this.state[this.id2List[id]];

    onDragEnd = result => {
        const { source, destination } = result
        this.props.onSetActiveProperty(this.props.addresses.find(property => property.key === parseInt(result.draggableId.slice(1))))
        const newList = move(
            this.getList(source.droppableId),
            this.getList(destination.droppableId),
            source,
            destination
        )

        if (!destination) {
            return;
        }

        //If only reordering
        if (source.droppableId === destination.droppableId) {
            if (source.droppableId === 'droppable2') { 
                const orderedItems = reorder(
                    this.getList(source.droppableId),
                    source.index,
                    destination.index
                )
                orderedItems.forEach((item, i) => {
                    item.route_position = i
                })
                this.setState({selected: orderedItems})
                this.onSave(orderedItems)
            }   
        } else {   //if  moving from one list to another

            newList.droppable2.forEach((item, i) => item.route_position = i)
            if ((destination.droppableId === "droppable2")) { //If adding to route
                let droppedCard = newList.droppable2.find(item => item.key === parseInt(result.draggableId.slice(1))) 
                if (this.state.selected.find(item => item.key === droppedCard.key)) { // if customer already on route
                    alert(`${droppedCard.cust_name} is already on ${this.props.activeRoute}`)
                    let rect = document.getElementById(`${droppedCard.key}routecard`).getBoundingClientRect().top
                    let scrollTop = document.getElementById('droppable2scroll').scrollTop 
                    document.getElementById('droppable2scroll').scrollTop = rect + scrollTop - (window.innerHeight * .3)
                } else {
                    droppedCard.status="Waiting"
                    this.setState({selected: newList.droppable2})
                    this.onSave(newList.droppable2, droppedCard, 'on') 
                }
            }      
            else if (destination.droppableId === "droppable") {  
                let droppedCard = newList.droppable.find(item => item.key === parseInt(result.draggableId.slice(1)))  
               this.setState({selected: newList.droppable2})
                this.onSave(newList.droppable2, droppedCard, 'off') 
   
               }   // this.setSelected()
        }        
    }

    handlePropertyClick = (property) => {
        this.props.onSetActiveProperty(property)
    }

    onSearchChange = (event) => {
        this.setState({searchField: event.target.value})        
    }

    onRouteSearchChange = (event) => {
        this.setState({routeSearchField: event.target.value})
    }

    onNewPropertyClick = () => {
        //this.setState({scrollPosition: document.getElementById('droppable2scroll').scrollTop})
        this.props.onSetActiveProperty(null)
        this.setState((prevState) => ({showModal: !prevState.showModal}))       
    }

    onDetailsPropertyClick = (property) => {
        //this.setState({scrollPosition: document.getElementById('droppable2scroll').scrollTop})
        this.setState((prevState) => ({showModal: !prevState.showModal, activeProperty: property}), console.log(this.state.showModal))
    }

    onCloseClick = () => {
        this.setState((prevState) => ({showModal: !prevState.showModal}))
    }

    onDelete = () => {
        if (this.props.activeProperty.route_name === this.props.activeRoute) {
            this.props.onDeleteProperty(this.props.activeProperty, this.props.addresses, this.props.routeData, this.props.activeRoute)
        } else {
            this.props.onDeleteProperty(this.props.activeProperty, this.props.addresses, this.props.routeData)
        }      
        this.props.onSetActiveProperty(null)
    }

    onPropertySave = (newDetails) => {
        if(!newDetails.contract_type) {
            newDetails.contract_type = "Per Occurrence"
        }
        let {routeName, route_position, status, ...details} = newDetails
        if (!newDetails.key) {
            this.props.onSaveNewProperty(details, this.props.addresses)
        } else {
            this.props.onEditProperty(details, this.props.addresses)
        }
        this.setState({showModal: false})
        this.setSelected()
    }

    refreshData = () => {
        this.props.onGetAllAddresses()
        this.props.getRouteData()
    }
    
    render() {        
        return this.props.isAllPending || this.props.isRoutePending ?
        <h1></h1> :(
            <>
            <div style={{display: "flex", justifyContent: "space-around", margin: "3px"}}>
                {/* <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={this.refreshData}>Refresh Data</Button> */}
                <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={this.onInitRoute}>Initialize Route</Button>
                <Button variant="primary" size="sm" onClick={this.onNewPropertyClick}>New</Button>
            </div>
            <div className="adminGridContainer">
            <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="droppable2">                    
                    {(provided, snapshot) => (
                        <div
                            className="leftSide, scrollable"
                            id="droppable2scroll"
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}>
                            {this.state.selected.map((item, index) => (
                                <Draggable
                                    key={item.key}
                                    draggableId={`L${item.key.toString()}`}
                                    index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            id={`${item.key}routecard`}
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
                <CustomerDetails 
                    activeProperty={this.props.activeProperty} 
                    onSave={this.onPropertySave}
                    show={this.state.showModal}
                    close={this.onCloseClick}
                    onDelete={this.onDelete}
                />
            </div>
            </>  
        )
    }
}   

export default connect(mapStateToProps, mapDispatchToProps)(EditRoute)