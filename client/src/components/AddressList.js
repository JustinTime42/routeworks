import React, { Component } from "react"
import Can from "../components/Can"
import { AuthConsumer } from "../authContext"
import { connect } from "react-redux"

import { requestAllAddresses } from "../actions"

const mapStateToProps = state => {
    return {
        addresses: state.requestAllAddresses.addresses,
        isPending: state.requestAllAddresses.isPending,
        error: state.requestAllAddresses.error    
    }
}

const mapDispatchToProps = (dispatch) => {
    return {    
        onGetAllAddresses: () => dispatch(requestAllAddresses()) 
    }
}

const renderAddress = (address) => {
    return(
        <div>
            <p>{address.address}</p>{address.address}
        </div>
    )
}


class AddressList extends Component {

    componentDidMount() {
        this.props.onGetAllAddresses()
    }

render() {
    const {addresses, isPending, error } = this.props

    return isPending ?
    <h1> loading </h1> : 
    (
        <div>
            {
                addresses.map(address => renderAddress(address))
            }
          
           
        </div>
    )
}

}

export default connect(mapStateToProps, mapDispatchToProps)(AddressList)
