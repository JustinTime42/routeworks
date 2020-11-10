import React, { Component } from 'react' 
import { connect } from "react-redux"
import PropertyCard from "../components/PropertyCard"
import PropertyDetails from "../components/PropertyDetails"
import { setActiveProperty, getRouteProperties } from '../actions'

import '../styles/driver.css'

const mapStateToProps = state => {
    return {
        routeProperties: state.getRouteProperties.addresses,
        showRouteEditor: state.showRouteEditor.showRoute,
        activeProperty: state.setActiveProperty.activeProperty,
        activeRoute: state.setActiveRoute.activeRoute,
        driver: state.setActiveDriver.name
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onSetActiveProperty: (property) => dispatch(setActiveProperty(property)),
        onGetRouteProperties: (route) => dispatch(getRouteProperties(route))        
    }
}

class DisplayRoute extends Component {
    constructor(props){
        super(props)
        this.state = { 
            routeProperties: this.props.routeProperties.filter(item => !item.inactive),
            activeProperty: {}
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps !== this.props){
          this.setState({
            activeProperty: this.props.activeProperty})
        }
      }

    parseRouteData = (customer, route, field) => {
        return customer.route_data.some(item => item.route_name === route) ?
            customer.route_data.find(item => item.route_name === route)[field] : null
    }

    changeActiveProperty = (property = this.props.activeProperty, direction = '') => {
        console.log(property, direction)
        if (direction) {
            let currentPosition = this.props.routeProperties.findIndex(i => i.key === property.key)
            console.log(currentPosition)
            let nextPosition = (direction === 'next') ? currentPosition + 1 : currentPosition - 1
                console.log(nextPosition)
            if (nextPosition >= 0 && nextPosition < this.props.routeProperties.length) {
                this.props.onSetActiveProperty(this.props.routeProperties[nextPosition])
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
            <div className="driverGridContainer" style={{height: "90vh"}}>
                <div className="leftSide scrollable" style={{height: "100%", width:"100%"}}>
                    {
                        this.props.routeProperties.map((address, i )=> {                            
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