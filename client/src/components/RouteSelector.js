import React, { Component } from "react"
import axios from "axios"
import { Dropdown, DropdownButton, Button, Modal } from "react-bootstrap"
import Can from "../components/Can"
import { AuthConsumer } from "../authContext"
import { connect } from "react-redux"
import { setActiveRoute, requestRoutes, getRouteProperties, showRouteEditor } from "../actions"

const mapStateToProps = state => {
    return {
        activeRoute: state.setActiveRoute.activeRoute,
        routes: state.requestRoutes.routes,
        isPending: state.requestRoutes.isPending,
        error: state.requestRoutes.error,
        routeAddresses: state.getRouteProperties.addresses,
        routeIsPending: state.getRouteProperties.isPending,
        routeError: state.getRouteProperties.error,
        showRouteEditor: state.showRouteEditor.showEditor
    }
}

const mapDispatchToProps = (dispatch) => {
    return {    
        onRouteSelect: (event) => {
            dispatch(setActiveRoute(event))
            dispatch(getRouteProperties(event))
        },
        onRequestRoutes: () => dispatch(requestRoutes()),
        onGetRouteProperties: (event) => dispatch(getRouteProperties(event)),
        onShowEditor: (show) => dispatch(showRouteEditor(show)),
        //Do I put show editor as boolean true/false. When the item is selected, it runs onRouteSelect
        //this also happens when the button is pushed. So the button being pushed just needs to call onShowEditor. but...
        //then will it turn showEditor to false when a route is selected but EDIT button not presses?
        //the only thing onRouteSelect does is set the activeRoute and fetch the properties... Perhaps clicking the 
        //"edit" button sets showEditor to true. Then, when rendering, it goes something like this: 
        // showEditor ? <ShowEditor /> : <ShowRoute />
        // setActiveRoute would then also need to reset state.showEditor to false?  s
    }
}

const editStyle = {
    float: "right"
}



class RouteSelector extends Component {
    constructor(){
        super()
        this.state = {
            show: false,
            routeName: ""
        }
    }

    onSetRouteName = (event) => this.setState({routeName: event.target.value}) 
    handleClose = () => this.setState({show: false})
    handleShow = () => this.setState({show: true})
    handleSave = () => {
        axios.post(`https://snowline-route-manager.herokuapp.com/api/addroute`, { route_name: this.state.routeName })
        .then(res => {
          console.log(res)
          this.props.onRequestRoutes()
        })
        .catch(err => console.log(err)) //this is not updating the live list...
        this.handleClose()
    }

    componentDidMount() {
        this.props.onRequestRoutes();
    }   

    render() {
        const { routes, isPending, activeRoute, error, onRouteSelect } = this.props
        return isPending ?
        <h1>Loading</h1> :
            (           
            <DropdownButton title={activeRoute || "Select Route"} onSelect={onRouteSelect} >        
                <Dropdown.Item eventKey="Create New Route"><Button variant="primary" size="sm" onClick={this.handleShow}>Create New Route</Button></Dropdown.Item>
                {
                    routes.map(route => <Dropdown.Item key={route.route_name} eventKey={route.route_name}>{route.route_name}</Dropdown.Item>)
                }
                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header>Enter New Route</Modal.Header>
                    <Modal.Body>
                        <form>
                            <input onChange={this.onSetRouteName} type="text" name="routeName" placeholder="Route Name"></input>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                        Close
                        </Button>
                        <Button variant="primary" onClick={this.handleSave}>
                        Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
            </DropdownButton>
        )}
}

export default connect(mapStateToProps, mapDispatchToProps)(RouteSelector)