import React, { Component } from 'react' 
import { connect } from "react-redux"
import PropertyCard from "./PropertyCard"


const mapStateToProps = state => {
    return {
        routeAddresses: state.getRouteProperties.addresses,   
    }
}

class DisplayRoute extends Component {

    render(){
        return(
            <div>
                {
                    this.props.routeAddresses.map(address => <PropertyCard key={address.address} address={address} />)
                }
            </div>
        )
    }
}

export default connect(mapStateToProps)(DisplayRoute)


