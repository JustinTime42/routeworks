import React, { Component } from 'react' 
import { connect } from "react-redux"
import PropertyCard from "../components/PropertyCard"
import PropertyDetails from "../components/PropertyDetails"
import { setActiveProperty, getRouteProperties } from '../actions'

import '../styles/driver.css'

const mapStateToProps = state => {
    return {
        //routeProperties: state.getRouteProperties.addresses,
        // showRouteEditor: state.showRouteEditor.showRoute,
        activeProperty: state.setActiveProperty.activeProperty,
        activeRoute: state.setActiveRoute.activeRoute,
        driver: state.setActiveDriver.name,
        routeData: state.getRouteData.routeData,
        addresses: state.requestAllAddresses.addresses,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onSetActiveProperty: (property) => dispatch(setActiveProperty(property)),
       // onGetRouteProperties: (addresses, routeData, route) => dispatch(getRouteProperties(addresses, routeData, route))        
    }
}

class DisplayRoute extends Component {
    constructor(props){
        super(props)
        this.state = { 
            routeProperties: this.getRouteProperties(),
            activeProperty: this.props.activeProperty  
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps !== this.props){
          this.setState({
            activeProperty: this.props.activeProperty,
            routeProperties: this.getRouteProperties(),
        })
      }
    }
    // parseRouteData = (customer, route, field) => {
    //     return customer.route_data.some(item => item.route_name === route) ?
    //         customer.route_data.find(item => item.route_name === route)[field] : null
    // }


    // let routeProperties = []
    // dispatch({ type: GET_ROUTE_PENDING})
    // routeData.forEach(routeEntry => {
    //     if (routeEntry.route_name === activeRoute) {
    //         let customer = addresses.find(property => property.key === routeEntry.property_key)
    //         routeProperties.push({...customer, route_position: routeEntry.route_position})
    //     }
    // })
    // routeProperties.sort((a, b) => a.route_position > b.route_position ? 1 : -1) 


    getRouteProperties = () => {
        let routeProperties = []
        this.props.routeData.forEach(routeEntry => {
            if (routeEntry.route_name === this.props.activeRoute) {
                let customer = this.props.addresses.find(property => property.key === routeEntry.property_key)
                routeProperties.push({...customer, routeName: routeEntry.route_name, route_position:routeEntry.route_position, status: routeEntry.status })
            }
        })
        console.log('reoute properties: ', routeProperties)
        return routeProperties.filter(item => !item.inactive).sort((a, b) => a.route_position > b.route_position ? 1 : -1) 
    }

    changeActiveProperty = (property = this.props.activeProperty, direction = '') => {
        console.log(property, direction)
        if (direction) {
            let currentPosition = this.state.routeProperties.findIndex(i => i.key === property.key)
            console.log(currentPosition)
            let nextPosition = (direction === 'next') ? currentPosition + 1 : currentPosition - 1
                console.log(nextPosition)
            if (nextPosition >= 0 && nextPosition < this.state.routeProperties.length) {
                this.props.onSetActiveProperty(this.state.routeProperties[nextPosition])
                if ((nextPosition - 1) > 0) {
                    document.getElementById(`card${nextPosition - 1}`).scrollIntoView(true)
                } else {
                    document.getElementById(`card${nextPosition}`).scrollIntoView(true)
                }
            }
        } else {
            this.props.onSetActiveProperty(property)
        }
    }

    render(){
        
        return(
            <div className="driverGridContainer" style={{height: "90vh", overflow: "auto"}}>
                <div className="leftSide scrollable" style={{height: "100%", width:"100%"}}>
                    {
                        this.state.routeProperties.map((address, i )=> {                            
                            return (
                                <PropertyCard                                                                    
                                    i={i}  
                                    route={this.props.activeRoute}                                   
                                    key={address.key} 
                                    address={address}
                                    activeProperty={this.props.activeProperty}
                                    handleClick={this.changeActiveProperty}                                    
                                />  
                            )                                                            
                        }) 
                    }
                </div>
                <div className="rightSide">
                    <PropertyDetails onStatusChange={this.onStatusChange} property={this.props.activeProperty} changeProperty={this.changeActiveProperty}/>
                </div> 
            </div>  
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DisplayRoute)