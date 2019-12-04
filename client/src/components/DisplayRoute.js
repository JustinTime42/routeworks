import React, { Component } from 'react' 
import { connect } from "react-redux"
import PropertyCard from "./PropertyCard"
import PropertyDetails from "./PropertyDetails"
import { setActiveProperty } from '../actions'

const mapStateToProps = state => {
    return {
        routeAddresses: state.getRouteProperties.addresses,
        showRouteEditor: state.showRouteEditor.showRoute,
        activeProperty: state.setActiveProperty.activeProperty
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onSetActiveProperty: (property) => dispatch(setActiveProperty(property))
        
    }
}

class DisplayRoute extends Component {

    handlePropertyClick = (property) => {
        this.props.onSetActiveProperty(property)
    }
    render(){
        return(
            <div className="gridContainer" style={{height: "100%", overflow: "auto"}}>
                <div className="leftSide" style={{height: "600px", overflow: "scroll", width:"80%"}}>
                    {
                        this.props.routeAddresses.map(address => {
                            return (
                                <PropertyCard                                     
                                    key={address.address} 
                                    address={address}
                                    activeProperty={this.props.activeProperty}
                                    handleClick={this.handlePropertyClick}
                                />  
                            )                                
                        }) 
                    }
                </div>
                <div className="rightSide">
                    <PropertyDetails property={this.props.activeProperty}/>
                </div> 
            </div>  
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DisplayRoute)