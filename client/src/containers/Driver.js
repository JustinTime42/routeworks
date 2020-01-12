import React, { Component } from "react"
import {connect } from "react-redux"
import RouteSelector from "../components/RouteSelector"
import DriverName from "../components/DriverName"
import DisplayRoute from "../components/DisplayRoute"
import RouteEditor from "../components/RouteEditor"
import EditRouteButton from "../components/AdminDropdown"
import BlackoutButton from "../components/BlackoutButton"
import { showRouteEditor } from "../actions"
import TractorName from "../components/TractorName"
import { Alert } from "react-bootstrap"

import '../styles/driver.css'

const mapStateToProps = state => {
    return {
        showRouteEditor: state.showRouteEditor.showEditor,
        isRoutePending: state.getRouteProperties.isPending,
        isAllPending: state.requestAllAddresses.isPending,
        driverName: state.setDriverName.driverName,
        tractorName: state.setTractorName.tractorName
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
            <div>
                <div style={{display: "flex", justifyContent: "space-around", margin: "5px"}}>    
                    <RouteSelector />
                    <DriverName />
                    <TractorName />
                    <EditRouteButton /> 
                    <BlackoutButton /> 
                </div>
                { 
                this.props.showRouteEditor ? <RouteEditor /> : 
                this.props.tractorName && this.props.driverName ? <DisplayRoute /> :
                <Alert variant="warning">Please enter driver and tractor name to begin.</Alert>                
                }                
            </div>            
        )
    }    
}

export default connect(mapStateToProps, mapDispatchToProps)(Driver)