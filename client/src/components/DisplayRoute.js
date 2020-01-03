import React, { Component } from 'react' 
import { connect } from "react-redux"
import PropertyCard from "./PropertyCard"
import PropertyDetails from "./PropertyDetails"
import { setActiveProperty, getRouteProperties } from '../actions'
import axios from 'axios'

const mapStateToProps = state => {
    return {
        routeProperties: state.getRouteProperties.addresses,
        showRouteEditor: state.showRouteEditor.showRoute,
        activeProperty: state.setActiveProperty.activeProperty,
        activeRoute: state.setActiveRoute.activeRoute,
        driver: state.setDriverName.driverName
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onSetActiveProperty: (property) => dispatch(setActiveProperty(property)),
        onGetRouteProperties: (route) => dispatch(getRouteProperties(route))        
    }
}

class DisplayRoute extends Component {
    constructor(props){
        super(props)
        this.state = { 
            selected: [],
            activeProperty: {}
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps !== this.props){
          this.setState({selected: this.props.routeProperties, activeProperty: this.props.activeProperty})
        }
      }

    handlePropertyClick = (property) => {
        this.props.onSetActiveProperty(property)
    }

    changeActiveProperty = (position) => {
        this.props.onSetActiveProperty(this.props.routeProperties.find( item => item.route_position === position))        
    }

    onStatusChange = (status) => {
        axios.post(`https://snowline-route-manager.herokuapp.com/api/setstatus`, 
            {
                property: this.props.activeProperty,
                newStatus: status,
                driver: this.props.driver
            }
        )
        .then(res => {
            this.props.onGetRouteProperties(this.props.activeRoute) 
            console.log(res)
        })
        .catch(err => console.log(err)) 
    }

    render(){
        return(
            <div className="gridContainer" style={{height: "100%", overflow: "auto"}}>
                <div className="leftSide" style={{height: "600px", overflow: "scroll", width:"80%"}}>
                    {
                        this.props.routeProperties.map(address => {
                            return (
                                <PropertyCard                                     
                                    key={address.address} 
                                    address={address}
                                    activeProperty={this.props.activeProperty}
                                    handleClick={this.handlePropertyClick}

                                />  
                            )                                
                        }) 
                    }
                </div>
                <div className="rightSide">
                    <PropertyDetails onStatusChange={this.onStatusChange} property={this.props.activeProperty} changeProperty={this.changeActiveProperty}/>
                </div> 
            </div>  
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DisplayRoute)