import React, { Component } from "react"
import {connect } from "react-redux"
import RouteSelector from "./RouteSelector"
import DriverName from "./DriverSelector"
import DisplayRoute from "./DisplayRoute"
import EditRoute from "./EditRoute"
import EditRouteButton from "./AdminDropdown"
import Spinner from "../components/Spinner"
import BlackoutButton from "../components/BlackoutButton"
import { showRouteEditor, getRouteData, requestAllAddresses } from "../actions"
import TractorName from "./TractorName"
import FullScreen from "../components/FullScreen"
import SearchBar from "../components/SearchBar"
import { Alert, Button } from "react-bootstrap"

import '../styles/driver.css'

const mapStateToProps = state => {
    return {
        showRouteEditor: state.showRouteEditor.showEditor,
        isRoutePending: state.getRouteProperties.isPending,
        isAllPending: state.requestAllAddresses.isPending,
        driverName: state.setActiveDriver.driver,
        activeTractor: state.setActiveTractor.activeTractor,
        routesPending: state.requestRoutes.isPending,
        activeRoute: state.setActiveRoute.activeRoute,
        routeData: state.getRouteData.routeData,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onShowEditor: () => dispatch(showRouteEditor(true)),
        onGetAllAddresses: () => dispatch(requestAllAddresses()),
        getRouteData: () => dispatch(getRouteData()),
    }
}

class Driver extends Component {

    componentDidMount() {
        this.refreshData()
    }

    refreshData = () => {
        this.props.onGetAllAddresses()
        this.props.getRouteData()
    }

    render() {
        return (
            <div style={{margin: "1em"}}>
                {
                (this.props.isAllPending || this.props.isRoutePending || this.props.routesPending) ? <Spinner /> : null
                } 
                <div style={{display: "flex", flexWrap: "no-wrap", justifyContent: "space-around", margin: "5px"}}>    
                    <RouteSelector />
                    <DriverName />
                    <TractorName />
                    <SearchBar />
                    <EditRouteButton /> 
                    <Button variant="primary" size="sm" onClick={this.refreshData}>Refresh Data</Button>
                    {/* <FullScreen />
                    <BlackoutButton />  */}
                </div>
                { 
                this.props.showRouteEditor ? <EditRoute /> : 
                this.props.activeTractor.name && (this.props.driverName.key !== '') ? <DisplayRoute /> :
                <Alert variant="warning">Please enter driver and tractor name to begin.</Alert>                              
                }             
            </div>            
        )
    }    
}

export default connect(mapStateToProps, mapDispatchToProps)(Driver)