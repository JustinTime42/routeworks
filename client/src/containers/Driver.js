import React, { Component } from "react"
import {connect } from "react-redux"
import RouteSelector from "./RouteSelector"
import DriverName from "./DriverSelector"
import DisplayRoute from "./DisplayRoute"
import EditRoute from "./EditRoute"
import EditRouteButton from "./AdminDropdown"
import Spinner from "../components/Spinner"
import BlackoutButton from "../components/BlackoutButton"
import { showRouteEditor, getRouteProperties, getRouteData, requestAllAddresses } from "../actions"
import TractorName from "./TractorName"
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
        routesPending: state.requestRoutes.isPending,
        activeRoute: state.setActiveRoute.activeRoute,
        routeData: state.getRouteData.routeData,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onShowEditor: () => dispatch(showRouteEditor(true)),
        //getRouteProperties: (route) => dispatch(getRouteProperties(route)),
        onGetAllAddresses: () => dispatch(requestAllAddresses()),
        getRouteData: () => dispatch(getRouteData()),
    }
}

class Driver extends Component {

    componentDidMount() {
        this.props.onGetAllAddresses()
        this.props.getRouteData()
    }

    // componentDidUpdate(prevProps) {
    //     if(prevProps.showRouteEditor !== this.props.showRouteEditor && this.props.showRouteEditor === false){
    //         this.props.getRouteProperties(this.props.activeRoute)
    //     }        
    // }

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
                this.props.showRouteEditor ? <EditRoute /> : 
                this.props.tractorName && (this.props.driverName.key !== '') ? <DisplayRoute /> :
                <Alert variant="warning">Please enter driver and tractor name to begin.</Alert>                              
                }             
            </div>            
        )
    }    
}

export default connect(mapStateToProps, mapDispatchToProps)(Driver)