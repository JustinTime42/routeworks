import React, { Component } from "react"
import DropdownButton from "react-bootstrap/DropdownButton"
import Dropdown from "react-bootstrap/Dropdown"
import Button from "react-bootstrap/Button"
import Can from "../components/Can"
import { AuthConsumer } from "../authContext"
import { connect } from "react-redux"
import { setActiveRoute, requestRoutes } from "../actions" 

const mapStateToProps = state => {
    return {
        activeRoute: state.setActiveRoute.activeRoute,
        routes: state.requestRoutes.routes,
        isPending: state.requestRoutes.isPending,
        error: state.requestRoutes.error
    }
}

const mapDispatchToProps = (dispatch) => {
    return {    
        onRouteSelect: (event) => dispatch(setActiveRoute(event.target.value)),
        onRequestRoutes: () => dispatch(requestRoutes()) 
    }
}

const editStyle = {
    float: "right"
}

//in the future this would pull from the routes tables
const routes = [
    "marybelle",
    "clementine",
    "bessy"
]


const renderRoute = (routeName) => {
    
    return (
        <AuthConsumer>
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
                                <Button size="sm" variant="secondary" style={editStyle}>Edit</Button>
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

    componentDidMount() {
        this.props.onRequestRoutes();
    }

    render() {
        const { routes, isPending, activeRoute, error } = this.props
        return isPending ?
        <h1>Loading</h1> :
            (           
            <DropdownButton title="Select Route" onSelect={function(evt){console.log(evt)}}>         
                <Dropdown.Item href="#/action-1">Make New Route</Dropdown.Item>
                {
                    routes.map(route => renderRoute(route))
                }  
            </DropdownButton>
        )}
}

    
export default connect(mapStateToProps, mapDispatchToProps)(RouteSelector)