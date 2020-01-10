import React, { Component } from "react"
import {connect } from "react-redux"
import RouteSelector from "../components/RouteSelector"
import DriverName from "../components/DriverName"
import DisplayRoute from "../components/DisplayRoute"
import RouteEditor from "../components/RouteEditor"
import EditRouteButton from "../components/AdminDropdown"
import BlackoutButton from "../components/BlackoutButton"
import { showRouteEditor } from "../actions"
import PropertyDetails from "../components/PropertyDetails"
import TractorName from "../components/TractorName"

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
            <div>
                <div style={{display: "flex", justifyContent: "space-around", margin: "5px"}}>                    
                    
                    <RouteSelector />
                    <DriverName />
                    <TractorName />
                    <EditRouteButton /> 
                    <BlackoutButton /> 
                {/* <div className="gridContainer"> 
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <RouteSelector />
                    <DriverName />
                    <EditRouteButton /> 
                </div>
                <div className="rightSide">
                                       
                </div>                  */}

                </div>
                {this.props.showRouteEditor ? <RouteEditor /> : <DisplayRoute />}
            </div>
            
        )
    }    
}

export default connect(mapStateToProps, mapDispatchToProps)(Driver)