import React, { Component } from "react"
import { connect } from 'react-redux'
import { setDriverName } from '../actions'

const mapStateToProps = state => {
    return {
        driverName: state.setDriverName.driverName
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onSetDriverName: (event) => dispatch(setDriverName(event.target.value))
    }
}

class DriverName extends Component {

    render() {
        const { onSetDriverName } = this.props
        return (
            <form>
            <input onChange={onSetDriverName} type="text" name="driverName" placeholder="Driver Name"></input>
        </form>
        )
    } 
}

export default connect(mapStateToProps, mapDispatchToProps)(DriverName)   