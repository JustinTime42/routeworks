import React, { Component } from "react"
import axios from "axios"
import DropdownButton from "react-bootstrap/DropdownButton"
import Dropdown from "react-bootstrap/Dropdown"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import Can from "../components/Can"
import { AuthConsumer } from "../authContext"
import { connect } from "react-redux"
import { setActiveRoute, requestRoutes, getRouteProperties } from "../actions"

const mapStateToProps = state => {
    return {
        activeRoute: state.setActiveRoute.activeRoute,
        routes: state.requestRoutes.routes,
        isPending: state.requestRoutes.isPending,
        error: state.requestRoutes.error,
        routeAddresses: state.getRouteProperties.addresses,
        routeIsPending: state.getRouteProperties.isPending,
        routeError: state.getRouteProperties.error
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
    }
}

const editStyle = {
    float: "right"
}

const renderRoute = (routeName) => {  
    return (
        <AuthConsumer key={routeName}>
            {({ authenticated }) =>
            authenticated ? (
                <AuthConsumer>
                {({ user }) => (
                    <Can
                        role={user.role}
                        perform="admin:visit"
                        yes={() => (
                            <Dropdown.Item eventKey={routeName}>
                                {routeName}
                                <Button size="sm" variant="secondary" style={editStyle} onClick={() => console.log(`edit route ${routeName}`)}>Edit</Button>
                                {/* onclick: display dragAndDrop with normal <DisplayRoute> on the left and AllAddresses on the right */}
                            </Dropdown.Item>
                        )}
                        no={() => <Dropdown.Item eventKey={routeName}>{routeName}</Dropdown.Item>}               
                    />                            
                )}
                </AuthConsumer>
            ) : (
                <div></div>
            )
            }
        </AuthConsumer>           
    ) 
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
                <Dropdown.Item eventKey="Create New Route"><Button variant="primary" onClick={this.handleShow}>Create New Route</Button></Dropdown.Item>
                {
                    routes.map(route => renderRoute(route.route_name))
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