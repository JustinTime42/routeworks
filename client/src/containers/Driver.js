import React, { Component } from "react"
import {connect } from "react-redux"
import RouteSelector from "../components/RouteSelector"
import DriverName from "../components/DriverName"
import DisplayRoute from "../components/DisplayRoute"
import RouteEditor from "../components/RouteEditor"
import EditRouteButton from "../components/EditRouteButton"
import { showRouteEditor } from "../actions"

import '../styles/driver.css'

const mapStateToProps = state => {
    return {
        showRouteEditor: state.showRouteEditor.showEditor,
        isRoutePending: state.getRouteProperties.isPending,
        isAllPending: state.requestAllAddresses.isPending,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onShowEditor: () => dispatch(showRouteEditor(true))
    }
}
class Driver extends Component {

    render() {
        return (
            <div className="gridContainer">
                <div className="leftSide">
                    <RouteSelector />
                    <DriverName />
                </div>
                <div className="rightSide">
                    <EditRouteButton />
                </div> 
                {this.props.showRouteEditor ? <RouteEditor /> : <DisplayRoute />}
            </div>
        )
    }    
}

export default connect(mapStateToProps, mapDispatchToProps)(Driver)