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
            //routeProperties: this.props.routeProperties.filter(item => !item.inactive), //not currently in use
            activeProperty: this.props.activeProperty})
        }
      }

    parseRouteData = (customer, route, field) => {
        return customer.route_data.some(item => item.route_name === route) ?
            customer.route_data.find(item => item.route_name === route)[field] : null
    }

    changeActiveProperty = (property = this.props.activeProperty, direction = '') => {
        if (direction) {
            //let current position be indexOf(this.props.routeProperties) = of the active property right?
            // I just need the index of activeProperty within routeProperties. That's the 

            // let currentPosition = this.parseRouteData(property, this.props.activeRoute, 'route_position')
            //     console.log(currentPosition)
            let currentPosition = this.routeProperties.indexOf(this.props.activeProperty)

            let nextPosition = (direction === 'next') ? currentPosition + 1 : currentPosition - 1
                console.log(nextPosition)

            // this.props.onSetActiveProperty(this.props.routeProperties.find(customer => (
            //     this.parseRouteData(customer, this.props.activeRoute, 'route_position') === nextPosition 
            // )))  
            this.props.onSetActiveProperty(this.routeProperties[nextPosition])
            if ((currentPosition - 2) > 0) {                              
                document.getElementById(`card${currentPosition - 2}`).scrollIntoView(true) 
            }
        } else {
            this.props.onSetActiveProperty(property)
        }

        

        // const previous = (i) => {
        //     return this.props.routeProperties.slice().reverse().find(item => {
        //         return (
        //             this.parseRouteData(item, this.props.activeRoute, 'route_position') < this.parseRouteData(item, this.props.activeRoute, 'route_position') + i
        //         )   
        //     }) 
        // }
        // if (direction === "next") {
        //     this.props.onSetActiveProperty(this.props.routeProperties.find( item => item.route_position > this.props.activeProperty.route_position))
        // } else {            
        //     this.props.onSetActiveProperty(previous(0))
        // }     
        // if (previous(-2)) {    
        //     const id = previous(-2).route_position           
        //     document.getElementById(`card${id}`).scrollIntoView(true) 
        // }

    }

    render(){
        return(
            <div className="driverGridContainer" style={{height: "100%", overflow: "auto"}}>
                <div className="leftSide scrollable" style={{height: "90vh", width:"100%"}}>
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