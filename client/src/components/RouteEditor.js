import React, { Component } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { connect } from "react-redux"
import { requestAllAddresses, getRouteProperties, UpdateRouteProperties, saveRoute, setActiveProperty } from "../actions"
import Button from 'react-bootstrap/Button'
import axios from "axios"
import PropertyCard from "./PropertyCard"

const mapStateToProps = state => {
    return {
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
        onGetRouteProperties: (route) => dispatch(getRouteProperties(route))
        //onUpdateRouteProperties: (properiesy, routeName) => dispatch(UpdateRouteProperties(properties, routeName))
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

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? 'lightgreen' : 'grey',

    // styles we need to apply on draggables
    ...draggableStyle
});

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'lightblue' : 'lightgrey',
    padding: grid,
    width: 250
});

class RouteEditor extends Component {
    constructor(props){
        super(props)
        this.state = { 
            items: [],
            filteredItems: [],
            selected: [],
            searchField: '',
        }
    }
    
    componentDidMount() {
        this.props.onGetAllAddresses() 
    }

    componentDidUpdate(prevProps) {
        if(prevProps.routeProperties !== this.props.routeProperties || prevProps.isAllPending !== this.props.isAllPending){
            console.log("new route properties")
          this.setState({selected: this.props.routeProperties })
          this.setState({items: this.props.addresses.filter(address => address.route_name !== this.props.activeRoute) })
          this.setState({filteredItems: this.props.addresses.filter(address => address.route_name !== this.props.activeRoute) }) 
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
                unselected: this.state.filteredItems
            }
        )
        .then(res => {
            this.props.onGetAllAddresses() 
            this.props.onGetRouteProperties(this.props.activeRoute)
            console.log(res)
        })
        .catch(err => console.log(err)) 
    }
  
    getList = id => this.state[this.id2List[id]];

    onDragEnd = result => {
        const { source, destination } = result;

        // dropped outside the list
        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const filteredItems = reorder(
                this.getList(source.droppableId),
                source.index,
                destination.index
            );

            let state = { filteredItems };

            if (source.droppableId === 'droppable2') {
                state = { selected: filteredItems };
            }

            this.setState(state);
        } else {
            const result = move(
                this.getList(source.droppableId),
                this.getList(destination.droppableId),
                source,
                destination
            );

            this.setState({
                filteredItems: result.droppable,
                selected: result.droppable2
            });
        }
    };

    handlePropertyClick = (property) => {
        this.props.onSetActiveProperty(property)
    }

    onSearchChange = (event) => {
        this.setState({searchField: event.target.value})
        let filteredItems = this.state.items.filter(property => {
          if (property.address && property.address.toLowerCase().includes(this.state.searchField.toLowerCase())) {
            return true
          } else if (property.route_name && property.route_name.toLowerCase().includes(this.state.searchField.toLowerCase())) {
            return true
          } else if (property.cust_name && property.cust_name.toLowerCase().includes(this.state.searchField.toLowerCase())) {
            return true
          } else if (property.cust_phone && property.cust_phone.toLowerCase().includes(this.state.searchField.toLowerCase())) {
            return true
          } else {return false}
        }
      )
        this.setState({filteredItems: filteredItems})
      }

    // Normally you would want to split things out into separate components.
    // But in this example everything is just done in one place for simplicity
    render() {
        
        return this.props.isAllPending || this.props.isRoutePending ?
        <h1>    </h1> :(
            <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="droppable2">                    
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}>
                                <Button variant="primary" onClick={this.onSave}>Save Route</Button>
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
                                            <PropertyCard key={item.address} address={item} admin={true} handleClick={this.handlePropertyClick}/>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}>
                                <input 
                                    type="search" placeholder="Search" 
                                    onChange={this.onSearchChange}
                                />
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
                                            <PropertyCard key={item.address} address={item} admin={true} handleClick={this.handlePropertyClick}/>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RouteEditor)
