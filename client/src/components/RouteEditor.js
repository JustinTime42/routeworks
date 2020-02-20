import React, { Component } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { connect } from "react-redux"
import { requestAllAddresses, getRouteProperties, UpdateRouteProperties, saveRoute, setActiveProperty, saveNewProperty, editProperty, deleteProperty } from "../actions"
import Button from 'react-bootstrap/Button'
import axios from "axios"
import PropertyCard from "./PropertyCard"
import NewProperty from "./NewProperty"
import '../styles/driver.css'

const mapStateToProps = state => {
    return {
        activeProperty: state.setActiveProperty.activeProperty,
        activeRoute: state.setActiveRoute.activeRoute,
        addresses: state.requestAllAddresses.addresses, 
        routeProperties: state.getRouteProperties.addresses,
        isRoutePending: state.getRouteProperties.isPending,
        isAllPending: state.requestAllAddresses.isPending,
        error: state.requestAllAddresses.error, 
    }
}

const mapDispatchToProps = (dispatch) => {
    return {    
        onSaveRoute: (route) => dispatch(saveRoute(route)),
        onGetAllAddresses: () => dispatch(requestAllAddresses()),
        onSetActiveProperty: (property) => dispatch(setActiveProperty(property)),
        onGetRouteProperties: (route) => dispatch(getRouteProperties(route)),
        onSaveNewProperty: (property, allAddresses) => dispatch(saveNewProperty(property, allAddresses)),
        onEditProperty: (property, allAddresses) => dispatch(editProperty(property, allAddresses)),
        onDeleteProperty: (property, allAddresses) => dispatch(deleteProperty(property, allAddresses))
    }
}

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
};

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
    userSelect: 'none',
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

class RouteEditor extends Component {
    constructor(props){
        super(props)
        this.state = { 
            items: this.props.addresses.filter(address => address.route_name !== this.props.activeRoute),
            filteredItems: this.props.addresses.filter(address => address.route_name !== this.props.activeRoute),
            selected: this.props.addresses.filter(address => address.route_name === this.props.activeRoute).sort((a, b) => (a.route_position > b.route_position) ? 1 : -1),
            searchField: '',
            showModal: false,
            activeProperty: this.props.activeProperty,            
        }
    }
    
    componentDidMount() {
        this.props.onGetAllAddresses()       
    }

    componentDidUpdate(prevProps, prevState) {

        if(this.props.isAllPending !== prevProps.isAllPending || prevProps.activeRoute !== this.props.activeRoute || this.props.addresses !== prevProps.addresses) {
            this.setState((prevState, prevProps) => {
                return {
                    selected: prevProps.addresses.filter(address => address.route_name === prevProps.activeRoute).sort((a, b) => (a.route_position > b.route_position) ? 1 : -1),
                    items: prevProps.addresses.filter(address => address.route_name !== prevProps.activeRoute),
                    filteredItems: prevProps.addresses.filter(address => address.route_name !== prevProps.activeRoute),
                    activeProperty: prevProps.activeProperty
                }
            })   
        } 
    }

    id2List = {
        droppable: 'filteredItems',
        droppable2: 'selected'
    };

    onSave = () => {
        axios.post('https://snowline-route-manager.herokuapp.com/api/saveroute', 
            {
                route: this.props.activeRoute,
                selected: this.state.selected,
                unselected: this.state.items
            }
        )
        .then(res => {
            this.props.onGetAllAddresses()
            console.log(res)
        })
        .catch(err => console.log(err)) 
    }

    onInitRoute = () => {
        this.setState((prevState) => ({selected: prevState.selected.map(item => item.status = "Waiting")}, this.onSave()))
        // axios.post('https://snowline-route-manager.herokuapp.com/api/initroute',
        // {
        //     route: this.state.selected               
        // })
        // .then(res => {
        //     this.props.onGetAllAddresses()
        //     this.onSave()
        //     console.log(res)
        // }) 
        // .catch(err => console.log(err))
    }
    
    getList = id => this.state[this.id2List[id]];

    onDragEnd = result => {
        const { source, destination } = result;

        // dropped outside the list
        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const orderedItems = reorder(
                this.getList(source.droppableId),
                source.index,
                destination.index
            );

            let state = { orderedItems };

            if (source.droppableId === 'droppable2') {
                
                state = { selected: orderedItems };
            }

            this.setState(state);
        } else {
            const result = move(
                this.getList(source.droppableId),
                this.getList(destination.droppableId),
                source,
                destination
            )
            
            result.droppable2.forEach((item, i) => {
                item.route_name = this.props.activeRoute
                item.status = !item.status ? "Waiting" : item.status
                item.route_position = i
                this.props.onEditProperty(item, this.props.addresses)
                this.setState((prevState, prevProps) => {
                    return {
                    items: prevProps.addresses.filter(item => item.route_name !== prevProps.activeRoute),  
                    filteredItems: this.onFilterProperties(prevState.searchField),
                    selected: prevProps.addresses.filter(item => item.route_name === prevProps.activeRoute).sort((a, b) => (a.route_position > b.route_position) ? 1 : -1)
                    }
                })                                                                                                
            })
            
            result.droppable.forEach((item, i) => {
                if (item.route_name === this.props.activeRoute){
                    item.route_name = "unassigned"
                    item.status = ""
                    item.route_position = null
                    this.props.onEditProperty(item, this.props.addresses)
                    this.setState((prevState, prevProps) => {
                        return {
                            items: prevProps.addresses.filter(item => item.route_name !== prevProps.activeRoute),
                            filteredItems: this.onFilterProperties(prevState.searchField),                          
                            selected: prevProps.addresses.filter(item => item.route_name === prevProps.activeRoute).sort((a, b) => (a.route_position > b.route_position) ? 1 : -1)
                        }
                    })
                }
            })
            this.onFilterProperties(this.state.searchField)
        }        
    }

    handlePropertyClick = (property) => {
        this.props.onSetActiveProperty(property)
    }

    onFilterProperties = (filter = "") => {        
        let filteredItems = this.props.addresses.filter(property => {
            if (property.route_name !== this.props.activeRoute) {  
                if (!this.state.searchField) {
                    return true
                } else if (property.address && property.address.toLowerCase().includes(filter.toLowerCase())) {
                    return true
                } else if (property.route_name && property.route_name.toLowerCase().includes(filter.toLowerCase())) {
                    return true
                } else if (property.cust_name && property.cust_name.toLowerCase().includes(filter.toLowerCase())) {
                    return true
                } else if (property.cust_phone && property.cust_phone.toLowerCase().includes(filter.toLowerCase())) {
                    return true
                } else {return false}
            } else {return false}            
        })  
        return filteredItems  
    }

    onSearchChange = (event) => {
        const filteredItems = this.onFilterProperties(event.target.value)
        this.setState({searchField: event.target.value, filteredItems: filteredItems})        
    }

    onNewPropertyClick = () => {
        this.props.onSetActiveProperty(null)
        this.setState((prevState) => ({showModal: !prevState.showModal}))       
    }

    onEditPropertyClick = (property) => {
        this.setState((prevState) => ({showModal: !prevState.showModal, activeProperty: property}))
    }

    onCloseClick = () => {
        this.setState((prevState) => ({showModal: !prevState.showModal}))
    }

    onDelete = () => {
        this.props.onDeleteProperty(this.props.activeProperty, this.props.addresses)
        this.props.onSetActiveProperty(null)
    }

    onPropertySave = (newDetails) => {
        if (!newDetails.key) {
            this.props.onSaveNewProperty(newDetails, this.props.addresses)

        } else {
            this.props.onEditProperty(newDetails, this.props.addresses)
        }
        this.setState((prevState, prevProps) => {
            return {
            items: prevProps.addresses.filter(item => item.route_name !== prevProps.activeRoute),
            filteredItems: this.onFilterProperties(prevState.searchField),                          
            selected: prevProps.addresses.filter(item => item.route_name === prevProps.activeRoute).sort((a, b) => (a.route_position > b.route_position) ? 1 : -1)
            }
        })
    }
    
    render() {
        
        return this.props.isAllPending || this.props.isRoutePending ?
        <h1></h1> :(
            <>
            <div style={{display: "flex", justifyContent: "space-around", margin: "3px"}}>
                <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={this.onSave}>Save Changes</Button>
                <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={this.onInitRoute}>Initialize Route</Button>
                <input 
                    type="search" placeholder="Search" 
                    onChange={this.onSearchChange}
                />
                <Button variant="primary" size="sm" onClick={this.onNewPropertyClick}>New</Button>
            </div>
            <div className="adminGridContainer">
            <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="droppable2">                    
                    {(provided, snapshot) => (
                        <div
                            className="leftSide, scrollable"
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}>
                            {this.state.selected.map((item, index) => (
                                <Draggable
                                    key={item.key}
                                    draggableId={item.key.toString()}
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
                                                key={item.key} 
                                                address={item} 
                                                admin={true} 
                                                editClick={this.onEditPropertyClick} 
                                                handleClick={this.handlePropertyClick}
                                                onSave={this.onPropertySave}/>
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
                                    draggableId={item.key.toString()}
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
                                            <PropertyCard key={item.key} address={item} admin={true} editClick={this.onEditPropertyClick} handleClick={this.handlePropertyClick}/>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
                <NewProperty 
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

export default connect(mapStateToProps, mapDispatchToProps)(RouteEditor)
