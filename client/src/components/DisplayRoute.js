import React, { Component } from 'react' 
import { connect } from "react-redux"
import PropertyCard from "./PropertyCard"
import PropertyDetails from "./PropertyDetails"
import { setActiveProperty, getRouteProperties } from '../actions'

import '../styles/driver.css'

const mapStateToProps = state => {
    return {
        routeProperties: state.getRouteProperties.addresses,
        showRouteEditor: state.showRouteEditor.showRoute,
        activeProperty: state.setActiveProperty.activeProperty,
        activeRoute: state.setActiveRoute.activeRoute,
        driver: state.setDriverName.driverName
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
            selected: [],
            activeProperty: {}
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps !== this.props){
          this.setState({selected: this.props.routeProperties, activeProperty: this.props.activeProperty})
        }
      }

    handlePropertyClick = (property) => {
        this.props.onSetActiveProperty(property)
    }

    changeActiveProperty = (position) => {
        this.props.onSetActiveProperty(this.props.routeProperties.find( item => item.route_position === position)) 
        console.log(`card${position}`)
        if (document.getElementById(`card${position}`)) {
            console.log(`card${position}`)
            document.getElementById(`card${position}`).scrollIntoView(true) //.scroll(0,100)
        } 
       
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
                                    key={address.key} 
                                    address={address}
                                    activeProperty={this.props.activeProperty}
                                    handleClick={this.handlePropertyClick}

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