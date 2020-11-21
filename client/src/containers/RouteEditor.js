import React, { Component } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { connect } from "react-redux"
import { requestAllAddresses, getRouteProperties, filterRouteProperties, saveRoute, setActiveProperty, saveNewProperty, editProperty, deleteProperty } from "../actions"
import Button from 'react-bootstrap/Button'
import axios from "axios"
import PropertyCard from "../components/PropertyCard"
import NewProperty from "../components/CustomerEditor"
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
        onDeleteProperty: (property, allAddresses, routeName) => dispatch(deleteProperty(property, allAddresses, routeName)),
        onFilterRouteProperties: (addresses, route) => dispatch(filterRouteProperties(addresses, route))
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
            items: this.setUnselected(this.props.addresses, this.props.activeRoute),
            filteredItems: this.setUnselected(this.props.addresses, this.props.activeRoute),
            selected: this.setSelected(this.props.addresses, this.props.activeRoute),
            searchField: '',
            routeSearchField: '',
            showModal: false,
            activeProperty: this.props.activeProperty,      
            modified: [],      
        }
    }
    
    componentDidMount() {
        this.props.onGetAllAddresses()     
    }

    componentDidUpdate(prevProps, prevState) {
        if(this.props.isRoutePending !== prevProps.isRoutePending || this.props.isAllPending !== prevProps.isAllPending || prevProps.activeRoute !== this.props.activeRoute || this.props.addresses !== prevProps.addresses) {
            this.setState((prevState, prevProps) => {
                return {
                    selected: this.setSelected(prevProps.addresses, prevProps.activeRoute),
                    items: this.setUnselected(prevProps.addresses, prevProps.activeRoute),
                    filteredItems: this.onFilterProperties(prevState.searchField, prevProps.addresses),
                    activeProperty: prevProps.activeProperty
                }
            })
        } 
        if(this.state.searchField !== prevState.searchField) {
            this.setState((prevState, prevProps) => ({filteredItems: this.onFilterProperties(prevState.searchField, prevProps.addresses)}))
            // this.setState((prevState, prevProps) => {
            //     return {
            //         filteredItems: this.onFilterProperties(prevState.searchField, prevProps.addresses.filter(property => !property.route_data.some(route => route.route_name === this.props.activeRoute))),
            //     }
            // }) 
        }
        // if(this.state.routeSearchField !== prevState.routeSearchField) {
        //     this.setState((prevState, prevProps) => {
        //         return {
        //             selected: this.onFilterProperties(prevState.routeSearchField, prevProps.addresses.filter(property => property.route_data.some(route => route.route_name === this.props.activeRoute)))
        //         }
        //     })
        // }

    }

    id2List = {
        droppable: 'filteredItems',
        droppable2: 'selected'
    }

    setSelected = (addresses, route) => {
        return addresses.filter(item => item.route_data.some(item => item.route_name === route))
            .sort((a, b) => a.route_data.find(item => item.route_name === route).route_position > b.route_data.find(item => item.route_name === route).route_position ? 1 : -1) 
    }

    setUnselected = (addresses, route) => {
        return addresses.filter(item => !item.route_data.some(item => item.route_name === route))
    }
    
    onSave = () => {
        axios.post(`${process.env.REACT_APP_API_URL}/saveroute`, 
            {
                route: this.props.activeRoute,
                selected: this.state.selected,
                unselected: this.state.items
            }
        )
        .then(res => {
            this.props.onGetRouteProperties(this.props.activeRoute)
            this.props.onGetAllAddresses()
            this.props.onFilterRouteProperties(this.props.addresses, this.props.activeRoute)
            console.log(res)
        })
        .catch(err => console.log(err)) 
    }

    onInitRoute = () => {        
        this.setState((prevState, prevProps) => {
            let selected = prevState.selected 
            selected.forEach(customer => customer.route_data.find(route => route.route_name === prevProps.activeRoute).status = "Waiting")           
            return {
                selected: selected
            }
        }, this.onSave())
    }
    
    getList = id => this.state[this.id2List[id]];

    onDragEnd = result => {
        const { source, destination } = result
        
        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const orderedItems = reorder(
                this.getList(source.droppableId),
                source.index,
                destination.index
            )

            let state = { orderedItems }

            if (source.droppableId === 'droppable2') { 

                orderedItems.forEach((item, i) => {
                    item.route_data.find(route => route.route_name === this.props.activeRoute).route_position = i
                })
                state = { selected: orderedItems };
            }
            this.setState(state);
        } else {
            const newList = move(
                this.getList(source.droppableId),
                this.getList(destination.droppableId),
                source,
                destination
            )
            newList.droppable2.forEach((item, i) => {
                let route_data = {
                    route_name: this.props.activeRoute,
                    route_position: i,
                    status: "Waiting"
                }
                if (item.route_data.some(item => item.route_name === this.props.activeRoute)) {
                    item.route_data.find(route => route.route_name === this.props.activeRoute).route_position = i
                } else {
                    item.route_data.push(route_data)
                }

                // save changes to redux and state
                // needs rework. Maybe make a way to send the new property lists at once instead
                // of dispatching an action per item in the list
                
                
                // this is currently needed to keep the recently dragged item, but is stupid. plz change.
                this.setState((prevState, prevProps) => {
                    return {
                        selected: this.setSelected(prevProps.addresses, prevProps.activeRoute),
                        items: this.setUnselected(prevProps.addresses, prevProps.activeRoute),
                        filteredItems: this.onFilterProperties(prevState.searchField, prevProps.addresses),
                    }
                })                                                                                              
            })
           
            if (destination.droppableId === "droppable") {
                let droppedCard = newList.droppable.find(item => item.key === parseInt(result.draggableId))
                droppedCard.route_data.splice(droppedCard.route_data.findIndex(route => route.route_name === this.props.activeRoute), 1)
                this.props.onEditProperty(droppedCard, this.props.addresses)

                // this is currently needed to keep the recently dragged item, but is stupid. plz change.
                this.setState((prevState, prevProps) => {
                    return {
                        selected: this.setSelected(prevProps.addresses, prevProps.activeRoute),
                        items: this.setUnselected(prevProps.addresses, prevProps.activeRoute),
                        filteredItems: this.onFilterProperties(prevState.searchField, prevProps.addresses),
                    }
                })
            }
        }        
    }

    handlePropertyClick = (property) => {
        this.props.onSetActiveProperty(property)
    }

    onFilterProperties = (filter = '', addresses = []) => {
        let filteredItems = addresses.filter(property => {
            if (property.route_data.some(route => route.route_name === this.props.activeRoute)) return false
            else {
                if (!filter) return true                          
                else if (property.cust_name && property.cust_name.toLowerCase().includes(filter.toLowerCase())) return true
                else if (property.address && property.address.toLowerCase().includes(filter.toLowerCase())) return true
                //else if (property.route_data.some(route => route.route_name.toLowerCase().includes(filter.toLowerCase()))) return true                
                else if (property.cust_phone && property.cust_phone.toLowerCase().includes(filter.toLowerCase())) return true
                else {return false}  
            } 
        })
        return filteredItems              
    }

    onSearchChange = (event) => {
        this.setState({searchField: event.target.value})        
    }

    onRouteSearchChange = (event) => {
        this.setState({routeSearchField: event.target.value})
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
        if (this.props.activeProperty.route_data.find(route => route.route_name === this.props.activeRoute)) {
            this.props.onDeleteProperty(this.props.activeProperty, this.props.addresses, this.props.activeRoute)
        } else {
            this.props.onDeleteProperty(this.props.activeProperty, this.props.addresses)
        }      
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
            items: this.setUnselected(prevProps.addresses, prevProps.activeRoute),
            filteredItems: this.onFilterProperties(prevState.searchField, prevProps.addresses),                          
            selected: this.setSelected(prevProps.addresses, prevProps.activeRoute),
            }
        })
    }
    
    render() {        
        return this.props.isAllPending || this.props.isRoutePending ?
        <h1></h1> :(
            <>
            <div style={{display: "flex", justifyContent: "space-around", margin: "3px"}}>
                <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={this.onSave}>Save Route</Button>
                {/* <input 
                    type="search" placeholder="Search" value={this.state.routeSearchField}
                    onChange={this.onRouteSearchChange}
                /> */}
                <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={this.onInitRoute}>Initialize Route</Button>
                <input 
                    type="search" placeholder="Search" value={this.state.searchField}
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
                                                route={this.props.activeRoute}
                                                key={item.key} 
                                                address={item} 
                                                admin={true} 
                                                editClick={this.onEditPropertyClick} 
                                                handleClick={this.handlePropertyClick}
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
                                                route={this.props.activeRoute} 
                                                key={item.key} 
                                                address={item} 
                                                admin={true} 
                                                editClick={this.onEditPropertyClick} 
                                                handleClick={this.handlePropertyClick}/>
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
