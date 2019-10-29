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
        onRouteSelect: (event) => dispatch(setActiveRoute(event)),
        onRequestRoutes: () => dispatch(requestRoutes()) 
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

    testRouteSelect(event) {
        console.log(event)
    }

    render() {
        const { routes, isPending, activeRoute, error, onRouteSelect } = this.props
        return isPending ?
        <h1>Loading</h1> :
            (           
            <DropdownButton title={activeRoute || "Select Route"} onSelect={onRouteSelect} >        
                <Dropdown.Item href="#/action-1">Make New Route</Dropdown.Item>
                {
                    routes.map(route => renderRoute(route.route_name))
                }  
            </DropdownButton>
        )}
}

    
export default connect(mapStateToProps, mapDispatchToProps)(RouteSelector)