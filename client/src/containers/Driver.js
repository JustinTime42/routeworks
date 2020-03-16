import React, { Component } from "react"
import {connect } from "react-redux"
import RouteSelector from "../components/RouteSelector"
import DriverName from "../components/DriverSelector"
import DisplayRoute from "../components/DisplayRoute"
import RouteEditor from "../components/RouteEditor"
import EditRouteButton from "../components/AdminDropdown"
import Spinner from "../components/Spinner"
import BlackoutButton from "../components/BlackoutButton"
import { showRouteEditor } from "../actions"
import TractorName from "../components/TractorName"
import FullScreen from "../components/FullScreen"
import { Alert } from "react-bootstrap"

import '../styles/driver.css'

const mapStateToProps = state => {
    return {
        showRouteEditor: state.showRouteEditor.showEditor,
        isRoutePending: state.getRouteProperties.isPending,
        isAllPending: state.requestAllAddresses.isPending,
        driverName: state.setActiveDriver.driver,
        tractorName: state.setTractorName.tractorName,
        routesPending: state.requestRoutes.isPending
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
            <div style={{margin: "1em"}}>
                {
                (this.props.isAllPending || this.props.isRoutePending || this.props.routesPending) ? <Spinner /> : null
                } 
                <div style={{display: "flex", flexWrap: "wrap", justifyContent: "space-around", margin: "5px"}}>    
                    <RouteSelector />
                    <DriverName />
                    <TractorName />
                    <EditRouteButton /> 
                    <FullScreen />
                    <BlackoutButton /> 
                </div>
                { 
                this.props.showRouteEditor ? <RouteEditor /> : 
                this.props.tractorName && (this.props.driverName.key !== '') ? <DisplayRoute /> :
                <Alert variant="warning">Please enter driver and tractor name to begin.</Alert>                              
                }    
             
            </div>            
        )
    }    
}

export default connect(mapStateToProps, mapDispatchToProps)(Driver)