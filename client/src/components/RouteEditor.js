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
    height: "600px", 
    overflow: "scroll", 
    width: "90%"
});

class RouteEditor extends Component {
    constructor(props){
        super(props)
        this.state = { 
            items: this.props.addresses.filter(address => address.route_name !== this.props.activeRoute),
            filteredItems: this.props.addresses.filter(address => address.route_name !== this.props.activeRoute),
            selected: this.props.addresses.filter(address => address.route_name === this.props.activeRoute),
            searchField: '',
            showModal: false,
            activeProperty: this.props.activeProperty,            
        }
    }
    
    componentDidMount() {
        this.props.onGetAllAddresses()       
    }

    componentDidUpdate(prevProps, prevState) {
        // if(this.props.activeRoute !== prevProps.activeRoute) {
        //     console.log("different!")
        //     this.setState({
        //       selected: this.props.addresses.filter(address => address.route_name === this.props.activeRoute),
        //       items: this.props.addresses.filter(address => address.route_name !== this.props.activeRoute),
        //       filteredItems: this.props.addresses.filter(address => address.route_name !== this.props.activeRoute),
        //       activeProperty: this.props.activeProperty
        //     })
        // }

        if(this.props.isAllPending !== prevProps.isAllPending || prevProps.activeRoute !== this.props.activeRoute || this.props.addresses !== prevProps.addresses) {
            console.log("different!")
            this.setState({
                selected: this.props.addresses.filter(address => address.route_name === this.props.activeRoute).sort((a, b) => (a.route_position > b.route_position) ? 1 : -1),
                items: this.props.addresses.filter(address => address.route_name !== this.props.activeRoute),
                filteredItems: this.props.addresses.filter(address => address.route_name !== this.props.activeRoute),
                activeProperty: this.props.activeProperty
            })   
        }
        
        //NOTE: now just need to figure out why it isn't populating until you change the active route
      
        // if(prevProps.activeRoute !== this.props.activeRoute){
        //     this.setState({
        //         selected: this.props.addresses.filter(address => address.route_name === this.props.activeRoute),
        //         items: this.props.addresses.filter(address => address.route_name !== this.props.activeRoute),
        //         filteredItems: this.props.addresses.filter(address => address.route_name !== this.props.activeRoute),
        //     })
        // }
    }

    id2List = {
        droppable: 'filteredItems',
        droppable2: 'selected'
    };

    onSave = () => {
        console.log("onsave starting")
        console.log(this.state.selected)
        axios.post('https://snowline-route-manager.herokuapp.com/api/saveroute', 
            {
                route: this.props.activeRoute,
                selected: this.state.selected,
                unselected: this.state.filteredItems
            }
        )
        .then(res => {    
            console.log("onSave done ")
            console.log(res)
            this.props.onGetAllAddresses()
            setTimeout(() => { 
                this.props.onGetRouteProperties(this.props.activeRoute)
                this.props.onGetAllAddresses()
            }, 1000);
        })
        .catch(err => console.log(err)) 
    }

    onInitRoute = () => {
        axios.post('https://snowline-route-manager.herokuapp.com/api/saveroute', 
            {
                route: this.props.activeRoute,
                selected: this.state.selected,
                unselected: this.state.filteredItems
            }
        )
        .then(res => {
            axios.post('https://snowline-route-manager.herokuapp.com/api/initroute',
            {
                route: this.state.selected               
            }
            )
            .then(res => {
                console.log(res)
                this.props.onGetAllAddresses()
                setTimeout(() => { 
                    this.props.onGetRouteProperties(this.props.activeRoute)
                    this.props.onGetAllAddresses()
                }, 500);
            })
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

            console.log(result)
            
            result.droppable2.forEach((item, i) => {
                item.route_name = this.props.activeRoute
                item.status = "Waiting"
                item.route_position = i
                this.props.onEditProperty(item, this.props.addresses)
                this.setState({
                    items: this.props.addresses.filter(item => item.route_name !== this.props.activeRoute),  
                    filteredItems: this.onFilterProperties(this.state.searchField),
                    selected: this.props.addresses.filter(item => item.route_name === this.props.activeRoute).sort((a, b) => (a.route_position > b.route_position) ? 1 : -1)
                })               
            })
            
            result.droppable.forEach(item => {
                if (item.route_name === this.props.activeRoute){
                    item.route_name = "unassigned"
                    item.status = ""
                    item.route_position = null
                    this.props.onEditProperty(item, this.props.addresses)
                    this.setState({
                        items: this.props.addresses.filter(item => item.route_name !== this.props.activeRoute),
                        filteredItems: this.onFilterProperties(this.state.searchField),                          
                        selected: this.props.addresses.filter(item => item.route_name === this.props.activeRoute)
                    })
                }
            })
            this.onFilterProperties(this.state.searchField)
        
            //console.log(selected)
            // this.setState({
            //     items: this.props.addresses,
            //     selected: this.props.addresses.filter(item => item.route_name === this.props.activeRoute)
            // })
        }        
    }

    handlePropertyClick = (property) => {
        console.log(this.state)
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
        this.setState({showModal: !this.state.showModal})        
    }

    onEditPropertyClick = (property) => {
        this.setState({showModal: !this.state.showModal, activeProperty: property})
    }

    onCloseClick = () => {
        this.setState({showModal: !this.state.showModal})
    }

    onDelete = () => {
        this.props.onDeleteProperty(this.props.activeProperty, this.props.addresses)

        // axios.post('https://snowline-route-manager.herokuapp.com/api/deleteproperty', 
        //     {
        //         ...this.state.activeProperty
        //     }
        // )
        // .then(res => {
        //     let sIndex = this.state.selected.findIndex(item => item.key === this.props.activeProperty.key)           
        //     let selectedProperties = this.state.selected
        //     selectedProperties.splice(sIndex, 1)
        //     this.setState({selected: selectedProperties})
        
        //     let filteredProperties = this.state.filteredItems
        //     let fIndex = this.state.filteredItems.findIndex(item => item.key === this.props.activeProperty.key)
        //     filteredProperties.splice(fIndex, 1)              

        //     let allProperties = this.state.items
        //     let iIndex = this.state.items.findIndex(item => item.key === this.props.activeProperty.key)
        //     allProperties.splice(iIndex, 1) 
        //     this.setState({items: allProperties, filteredItems: filteredProperties})
            
        //     this.onCloseClick()
        // })
        // .catch(err => console.log(err))

    }

    onPropertySave = (newDetails) => {  
        console.log(newDetails)
        if (!newDetails.key) {
            this.props.onSaveNewProperty(newDetails, this.props.addresses)

        } else {
            this.props.onEditProperty(newDetails, this.props.addresses)
        }
        this.setState({
            items: this.props.addresses.filter(item => item.route_name !== this.props.activeRoute),
            filteredItems: this.onFilterProperties(this.state.searchField),                          
            selected: this.props.addresses.filter(item => item.route_name === this.props.activeRoute).sort((a, b) => (a.route_position > b.route_position) ? 1 : -1)
        })
        //Now it updates, but messes with the order. 



        // if (!newDetails.key) {
        //     axios.post(`https://snowline-route-manager.herokuapp.com/api/newproperty`, 
        //         {
        //             ...newDetails
        //         }
        //     )
        //     .then(res => {
        //         console.log(res)
        //         let filteredAddresses = this.state.filteredItems
        //         filteredAddresses.push(res.data[0])
        //         let allAddresses = this.state.items
        //         allAddresses.push(res.data[0])
        //         this.setState({items: allAddresses})

        //     })
        //     .catch(err => console.log(err)) 
        // } else {
        //     let index = this.state.selected.findIndex(item => item.key === this.props.activeProperty.key)
        //     console.log(index)        
        //     if (index !== -1) {
        //         let properties = this.state.selected
        //         properties[index] = newDetails
        //         this.setState({selected: properties})
        //     } else {
        //         let properties = this.state.filteredItems
        //         let index = this.state.filteredItems.findIndex(item => item.key === this.props.activeProperty.key)
        //         properties[index] = newDetails
        //         this.setState({filteredItems: properties})
        //     }
        // }

    }
    
    render() {
        
        return this.props.isAllPending || this.props.isRoutePending ?
        <h1>    </h1> :(
            <div className="adminGridContainer">
            <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="droppable2">                    
                    {(provided, snapshot) => (
                        <div
                            className="leftSide, scrollable"
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}>
                                <div style={{display: "flex", justifyContent: "space-around"}}>
                                    <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={this.onSave}>Save Changes</Button>
                                    <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={this.onInitRoute}>Initialize Route</Button>
                                </div>
                                
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
                            ))//.sort((a, b) => a.route_position < b.route_position ? 1 : -1)
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
                                <div style={{display: "flex", justifyContent:"space-around", margin: "3px"}}>
                                    <input 
                                        type="search" placeholder="Search" 
                                        onChange={this.onSearchChange}
                                    />
                                    <Button variant="primary" size="sm" onClick={this.onNewPropertyClick}>New</Button>
                                </div>
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
                    activeProperty={this.state.activeProperty} 
                    onSave={this.onPropertySave}
                    show={this.state.showModal}
                    close={this.onCloseClick}
                    onDelete={this.onDelete}
                />
            </div>
           
        );
    }
}   

export default connect(mapStateToProps, mapDispatchToProps)(RouteEditor)
