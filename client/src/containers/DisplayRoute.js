import React, { Component } from 'react' 
import { connect } from "react-redux"
import PropertyCard from "../components/PropertyCard"
import PropertyDetails from "../components/PropertyDetails"
import { setActiveProperty, getRouteProperties } from '../actions'

import '../styles/driver.css'

const mapStateToProps = state => {
    return {
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
        }, console.log(this.state))
      }
    }

    getRouteProperties = () => {
        let routeProperties = []
        console.log("active Route: ", this.props.activeRoute)
        this.props.routeData.forEach(routeEntry => {
            if (routeEntry.route_name === this.props.activeRoute.name) {
                let customer = this.props.addresses.find(property => property.key === routeEntry.property_key)
                routeProperties.push({...customer, routeName: routeEntry.route_name, route_position:routeEntry.route_position, status: routeEntry.status, active: routeEntry.active })
            }
        })
        console.log('route properties: ', routeProperties)
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

    render() {        
        return(
            <div className="driverGridContainer" style={{height: "90vh", overflow: "auto"}}>
                <div className="leftSide scrollable" style={{height: "100%", width:"100%"}}>
                    {
                        this.state.routeProperties.map((address, i )=> {
                            if (address.active){
                                return (
                                    <PropertyCard                                                                    
                                        i={i}  
                                        route={this.props.activeRoute.name}                                   
                                        key={address.key} 
                                        address={address}
                                        activeProperty={this.props.activeProperty}
                                        handleClick={this.changeActiveProperty}                             
                                    />  
                                )   
                            }  else return null                          
                                                                                     
                        }) 
                    }
                </div>
                <PropertyDetails property={this.props.activeProperty} changeProperty={this.changeActiveProperty}/>
            </div>  
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DisplayRoute)