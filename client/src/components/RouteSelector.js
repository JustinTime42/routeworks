import React from "react"
import Dropdown from "react-bootstrap/Dropdown"
import Button from "react-bootstrap/Button"
import Can from "../components/Can"
import { AuthConsumer } from "../authContext";

const RouteSelector = () => {

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
                                <Dropdown.Item href="#/action-2">
                                    {routeName}
                                    <Button size="sm" variant="secondary" style={editStyle}>Edit</Button>
                                </Dropdown.Item>
                            )}
                            no={() => <Dropdown.Item href="#/action-2">{routeName}</Dropdown.Item>}               
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

    return (        
        <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
                Select Route
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item href="#/action-1">Make New Route</Dropdown.Item>
                {
                    routes.map(route => renderRoute(route))
                }
            </Dropdown.Menu>
        </Dropdown>
    )
}
    
export default RouteSelector