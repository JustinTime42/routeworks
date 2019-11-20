import React, { Component } from 'react' 
import { connect } from "react-redux"
import PropertyCard from "./PropertyCard"
import { setActiveProperty } from '../actions'

const mapStateToProps = state => {
    return {
        routeAddresses: state.getRouteProperties.addresses,
        showRouteEditor: state.showRouteEditor.showRoute

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
            <div>
                {
                    this.props.routeAddresses.map(address => <PropertyCard key={address.address} address={address} handleClick={this.handlePropertyClick} />)
                }
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DisplayRoute)