import React, { Component } from "react"
import axios from "axios"
import { Dropdown, DropdownButton, Button, Modal } from "react-bootstrap"
import Can from "../auth/Can"
import { AuthConsumer } from "../authContext"
import { connect } from "react-redux"
import { setActiveRoute, requestRoutes, getRouteProperties, showRouteEditor, setActiveProperty } from "../actions"

const mapStateToProps = state => {
    return {
        activeRoute: state.setActiveRoute.activeRoute,
        routes: state.requestRoutes.routes,
        isPending: state.requestRoutes.isPending,
        error: state.requestRoutes.error,
        //routeAddresses: state.getRouteProperties.addresses,
        routeIsPending: state.getRouteProperties.isPending,
        routeError: state.getRouteProperties.error,
        showRouteEditor: state.showRouteEditor.showEditor,
        // routeData: state.getRouteData.routeData,
        // addresses: state.requestAllAddresses.addresses,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {    
        onRouteSelect: (event) => {
            if (event === "Create New Route") {
                return
            } else {
                dispatch(setActiveRoute(event))
                //dispatch(getRouteProperties(this.props.addresses, this.props.routeData, event))
                dispatch(setActiveProperty(null))
            }
        },
        onRequestRoutes: () => dispatch(requestRoutes()),
        //onGetRouteProperties: (addresses, routeData, route) => dispatch(getRouteProperties(addresses, routeData, route)),        
        onShowEditor: (show) => dispatch(showRouteEditor(show)),
        // onGetAllAddresses: () => dispatch(requestAllAddresses()),
        // getRouteData: () => dispatch(getRouteData()),
    }
}

const editStyle = {
    float: "right"
} // future feature

class RouteSelector extends Component {
    constructor(){
        super()
        this.state = {
            show: false,
            routeName: ""
        }
    }

    onSetRouteName = (event) => this.setState({routeName: event.target.value}) 
    handleClose = () => this.setState({show: false, routeName: ""})
    handleShow = () => this.setState({show: true})
    handleSave = () => {
        axios.post(`${process.env.REACT_APP_API_URL}/addroute`, { route_name: this.state.routeName })
        .then(res => {
          console.log(res)
          this.props.onRequestRoutes()
        })
        .catch(err => console.log(err)) 
        this.handleClose()
    }

    componentDidMount() {
        this.props.onRequestRoutes();
    }   

    render() {
        const { routes, isPending, activeRoute, error, onRouteSelect } = this.props
        return isPending ?
        <p>Loading</p> :
            (           
            <DropdownButton title={activeRoute || "Select Route"} onSelect={onRouteSelect} >      
                   <AuthConsumer>
                    {({ user }) => (
                        <Can
                            role={user.role}
                            perform="admin:visit"
                            yes={() => (
                                <Dropdown.Item eventKey="Create New Route"><Button variant="primary" size="sm" onClick={this.handleShow}>Create New Route</Button></Dropdown.Item>                      
                            )}
                            no={() => null}               
                        />                            
                    )}
                    </AuthConsumer>  
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