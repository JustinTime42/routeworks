import React, { Component } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { connect } from "react-redux"
import { requestAllAddresses, getRouteProperties, filterRouteProperties, saveRoute, setActiveProperty, saveNewProperty, editProperty, deleteProperty, getRouteData } from "../actions"
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
        //routeProperties: state.getRouteProperties.addresses,
        // isRoutePending: state.getRouteProperties.isPending,
        isAllPending: state.requestAllAddresses.isPending,
        error: state.requestAllAddresses.error,
        routeData: state.getRouteData.routeData,
    }
} 

const mapDispatchToProps = (dispatch) => {
    return {    
        onSaveRoute: (route) => dispatch(saveRoute(route)),
        onGetAllAddresses: () => dispatch(requestAllAddresses()),
        onSetActiveProperty: (property) => dispatch(setActiveProperty(property)),
      //  onGetRouteProperties: (route) => dispatch(getRouteProperties(route)),
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
            items: [], //this.setUnselected(this.props.addresses, this.props.activeRoute),
            filteredItems: [], //this.setUnselected(this.props.addresses, this.props.activeRoute),
            selected: [], //this.setSelected(this.props.addresses, this.props.activeRoute),
            searchField: '',
            routeSearchField: '',
            showModal: false,
            activeProperty: this.props.activeProperty,      
            modified: [],  
            scrollYPosition: 0    
        }
    }

    // getSnapshotBeforeUpdate(prevProps, prevState) {
    //     console.log(prevProps)
    //     if (prevState.activeProperty) {
    //        const routeScroll = document.getElementById(`${prevProps.activeProperty.key}routecard`)?.getBoundingClientRect().top
    //        console.log('routescroll', routeScroll)
    //         return {scrollToMessage: routeScroll}
    //     } else return null


        
    // }
    
    componentDidMount() {
        this.props.onGetAllAddresses()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {    
        // PROBLEM, setselected only pushes to selected, it doesn't actually modify the addresses to add routeName, that's why they route addresses are showing up in both lists... 
        if(this.props.isRoutePending !== prevProps.isRoutePending || this.props.isAllPending !== prevProps.isAllPending || prevProps.activeRoute !== this.props.activeRoute || this.props.addresses !== prevProps.addresses) {
            this.setSelected()
            this.setState((prevState, prevProps) => {
                return {
                    // selected: this.setSelected(prevProps.addresses, prevProps.activeRoute),
                    // items: this.setUnselected(prevProps.addresses, prevProps.activeRoute),
                    // filteredItems: this.onFilterProperties(prevState.searchField, prevProps.addresses),
                    activeProperty: prevProps.activeProperty
                }
            }, () => {
                if(this.props.activeProperty?.route_name === this.props.activeRoute) {
                    let currentPosition = this.props.activeProperty.route_position - 1
                    console.log("currentposition", currentPosition)  
                    if (document.getElementById(`card${currentPosition}`)) {
                        document.getElementById(`card${currentPosition}`).scrollIntoView(true)
                    }                    
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
        if (snapshot && prevProps.activeProperty) {
            //document.getElementById(`${prevProps.activeProperty.key}routecard`).scrollTo(0, snapshot.scrollToMessage)
            console.log(snapshot.scrollToMessage)
            // I think I'm scrolling or getting sroll position from the wrong element. maybe its a parent or child...
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

    setSelected = () => {
        
        let selected = []
        let customers = [...this.props.addresses]
        let route = this.props.activeRoute
        this.props.routeData.forEach(routeEntry => {
            if (routeEntry.route_name === route) {
                let i = customers.findIndex(customer => customer.key === routeEntry.property_key)
                let customer = customers[i]                
                selected.push({...customer, routeName: routeEntry.route_name, routePosition:routeEntry.route_position, status: routeEntry.status})
                customers[i].routeName = route
            }
        })
        let sortedSelect = selected.sort((a, b) => a.routePosition > b.routePosition ? 1 : -1) 
        let unselected = customers.filter(customer => customer.routeName !== route)
        this.setState({selected: sortedSelect, filteredItems: unselected})
        // let routeProperties = []
        // // look through all routeData. for each entry where route_name === this.props.activeRoute, 
        // // add that to the routeproperties, sort by route_position. return that. 
        // this.props.routeData.forEach(routeEntry => {
        //     if (routeEntry.route_name === this.props.activeRoute) {
        //         let customer = this.props.addresses.find(property => property.key === routeEntry.property_key)
        //         routeProperties.push({...customer, routeName: routeEntry.route_name, routePosition:routeEntry.route_position, status: routeEntry.status })
        //     }
        // })
        // //routeProperties.sort((a, b) => a.route_position > b.route_position ? 1 : -1) 
        // console.log('reoute properties: ', routeProperties)
        // return routeProperties.sort((a, b) => a.routePosition > b.routePosition ? 1 : -1) 
        // // return addresses.filter(item => item.route_name === route)
        // //     .sort((a, b) => a.route_position > b.route_position ? 1 : -1) 
    }

    // setUnselected = (addresses, route) => {
    //     return addresses.filter(item => item.routeName !== route)
    // }
    
    onSave = (customers, droppedCard = null, whereTo = 'same') => {
        // get route. for each property ( for each item in route_data => if status = "none", replace with status from fetched route?)
        // *sigh* this is  dumb and ugly...
        // fetch(`${process.env.REACT_APP_API_URL}/properties`)
        // .then(res => res.json())
        // .then(DBCustomers => {
        //     this.setState(prevState => 
        //         ({selected: prevState.selected.map(localCust => localCust.route_data.map(localCustRoute => {
        //             if (localCustRoute.status === "none") {
        //                 //this is kinda backwards... it won't be able to find the local customer from the DBCust because he isn't there yet. that's the whole point of dragging him over... 
        //                 //might need to fetch all customers for DBCustomers
        //                 let DBCust = DBCustomers[DBCustomers.findIndex(DBCust => DBCust.key === localCust.key)] //finds the corresponding fetched customer
        //                 let syncedCustStatus = DBCust.route_data[DBCust.route_data.findIndex(DBCustRoute => DBCustRoute.route_name === localCustRoute.route_name)].status //finds status of that customer
        //                 localCustRoute.status = syncedCustStatus
        //                 console.log("found 'none' status in: ", DBCust.cust_name)
        //                 console.log("status now set to:", syncedCustStatus)
        //             } 
        //         }))}), console.log("selected:", this.state.selected)
        //     )
        // })

        //this will strip selected down to the needed data
        let selected = customers.map(item => {
            return (
                {key: item.key, route_position: item.route_position}
            )
        })
        //next, I need to add the dragged item to it, if it doesn't exist already... ?
        axios.post(`${process.env.REACT_APP_API_URL}/saveroute`, 
            {
                route: this.props.activeRoute,
                selected: selected,
                droppedCard: {property_key: droppedCard?.key, route_position: droppedCard?.route_position, status: droppedCard?.status},
                whereTo: whereTo
            }
        )
        .then(res => {
            //this.props.onGetRouteProperties(this.props.activeRoute)
            this.props.onGetAllAddresses()
            // this.props.onFilterRouteProperties(this.props.addresses, this.props.activeRoute)
            this.props.getRouteData()
            console.log(res)
           // if(this.props.activeProperty) {
               
                // id={`card${(typeof(props.i) === 'number') ? props.i : props.address.key}`}
               // document.getElementById(`card${currentPosition}`).scrollIntoView(true)
          //  }
            
        })
        .catch(err => console.log(err)) 
    }

    //this will still need to be brought up to route_data management v3
    onInitRoute = () => {        
        this.setState((prevState, prevProps) => {
            let selected = prevState.selected 
            selected.forEach(customer => customer.status = "Waiting")           
            return {
                selected: selected
            }
        }, this.onSave(this.state.selected))
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
            if (source.droppableId === 'droppable2') { 

                orderedItems.forEach((item, i) => {
                    item.route_position = i
                })
                //state = { selected: orderedItems };
            }
            this.onSave(orderedItems)
            
        } else {
            const newList = move(
                this.getList(source.droppableId),
                this.getList(destination.droppableId),
                source,
                destination
            )

            newList.droppable2.forEach((item, i) => item.route_position = i)
            
            // here we are removing from route... 
            // here we will remove the route from droppedCard and submit selected and droppedCard,
            if (destination.droppableId === "droppable") {
                let droppedCard = newList.droppable.find(item => item.key === parseInt(result.draggableId))              
                //droppedCard.route_data.splice(droppedCard.route_data.findIndex(route => route.route_name === this.props.activeRoute), 1)
                // newList.droppable2.push(droppedCard)
               
                this.onSave(newList.droppable2, droppedCard, 'off') //Now we'll send the dropped card separately, so we can handle route data differently
                //  this.props.onEditProperty(droppedCard, this.props.addresses) <-- No, put this in onsave. keep edit property for non-route stuff

                // this is currently needed to keep the recently dragged item, but is stupid. plz change.
                // this.setState((prevState, prevProps) => {
                //     return {
                //         selected: this.setSelected(prevProps.addresses, prevProps.activeRoute),
                //         items: this.setUnselected(prevProps.addresses, prevProps.activeRoute),
                //         filteredItems: this.onFilterProperties(prevState.searchField, prevProps.addresses),
                //     }
                // })
            } else {
                // here we are adding a property to the route. so send only selected to onSave()
                let droppedCard = newList.droppable2.find(item => item.key === parseInt(result.draggableId)) 
                droppedCard.status="Waiting"

                // newList.droppable2.forEach((item, i) => {      
                //         item.route_position = i,
                //         status = "Waiting" // only set status for the droppedCard
                //     }
                //     if (item.key === droppedCard.key) {
                //         item.route_data.push(route_data)
                //     } else {
                //         item.route_data.find(route => route.route_name === this.props.activeRoute).route_position = i
                //     }
                // })
                this.onSave(newList.droppable2, droppedCard, 'on')
    
            } 
                // save changes to redux and state
                // needs rework. Maybe make a way to send the new property lists at once instead
                // of dispatching an action per item in the list                
                
                // this is currently needed to keep the recently dragged item, but is stupid. plz change.
                this.setSelected()
                // this.setState((prevState, prevProps) => {
                //     return {
                //         selected: this.setSelected(prevProps.addresses, prevProps.activeRoute),
                //         items: this.setUnselected(prevProps.addresses, prevProps.activeRoute),
                //         filteredItems: this.onFilterProperties(prevState.searchField, prevProps.addresses),
                //     }
                // }) 
        }        
    }

    handlePropertyClick = (property) => {
        this.props.onSetActiveProperty(property)
    }

    // onFilterProperties = (filter = '', addresses = []) => {
    //     let filteredItems = addresses.filter(property => {
    //         if (property.routeName) return false
    //         else {
    //             if (!filter) return true                          
    //             else if (property.cust_name?.toLowerCase().includes(filter.toLowerCase())) return true
    //             else if (property.address?.toLowerCase().includes(filter.toLowerCase())) return true
    //             //else if (property.route_data.some(route => route.route_name.toLowerCase().includes(filter.toLowerCase()))) return true                
    //            // else if (property.cust_phone && property.cust_phone.toLowerCase().includes(filter.toLowerCase())) return true
    //             else {return false}  
    //         } 
    //     })
    //     return filteredItems              
    // }

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
        if (this.props.activeProperty.route_name === this.props.activeRoute) {
            this.props.onDeleteProperty(this.props.activeProperty, this.props.addresses, this.props.activeRoute)
        } else {
            this.props.onDeleteProperty(this.props.activeProperty, this.props.addresses)
        }      
        this.props.onSetActiveProperty(null)
    }

    onPropertySave = (newDetails) => {
        if(!newDetails.contract_type) {
            newDetails.contract_type = "Per Occurrence"
        }
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
        }, () => {

            
            this.setState({showModal: false})
            // item.route_data.find(route => route.route_name === this.props.activeRoute).route_position
        })
    }
    
    render() {        
        return this.props.isAllPending || this.props.isRoutePending ?
        <h1></h1> :(
            <>
            <div style={{display: "flex", justifyContent: "space-around", margin: "3px"}}>
                <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={this.props.onGetAllAddresses}>Refresh Data</Button>
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
                            id="droppable2scroll"
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}>
                            {this.state.selected.map((item, index) => (
                                <Draggable
                                    key={item.key}
                                    draggableId={item.key.toString()}
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

export default connect(mapStateToProps, mapDispatchToProps)(EditRoute)
