import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import axios from "axios"
import { Dropdown, DropdownButton, Button, FormControl } from "react-bootstrap"
import Can from "../auth/Can"
import { AuthConsumer } from "../authContext"
import { connect } from "react-redux"
import { setActiveRoute, requestRoutes, getRouteData, showRouteEditor, setActiveProperty, deleteRoute } from "../actions"

// const mapStateToProps = state => {
//     return {
//         activeRoute: state.setActiveRoute.activeRoute,
//         routes: state.requestRoutes.routes,
//         isPending: state.requestRoutes.isPending,
//         error: state.requestRoutes.error,
//         //routeAddresses: state.getRouteProperties.addresses,
//         routeIsPending: state.getRouteProperties.isPending,
//         routeError: state.getRouteProperties.error,
//         showRouteEditor: state.showRouteEditor.showEditor,
//         // routeData: state.getRouteData.routeData,
//         // addresses: state.requestAllAddresses.addresses,
//     }
// }

// const mapDispatchToProps = (dispatch) => {
//     return {    
//         onRouteSelect: (event) => {
//             if (event === "Create New Route") {
//                 return
//             } else {
//                 dispatch(setActiveRoute(event))
//                 //dispatch(getRouteProperties(this.props.addresses, this.props.routeData, event))
//                 dispatch(setActiveProperty(null))
//             }
//         },
//         onRequestRoutes: () => dispatch(requestRoutes()),
//         //onGetRouteProperties: (addresses, routeData, route) => dispatch(getRouteProperties(addresses, routeData, route)),        
//         onShowEditor: (show) => dispatch(showRouteEditor(show)),
//         // onGetAllAddresses: () => dispatch(requestAllAddresses()),
//         // getRouteData: () => dispatch(getRouteData()),
//     }
// }

const editStyle = {
    float: "right"
} // future feature

const RouteSelector = () => {
    const [showEdit, setShowEdit] = useState(false)
    const [routeName, setRouteName] = useState("")
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routes = useSelector(state => state.requestRoutes.routes)
    const isPending = useSelector(state => state.requestRoutes.isPending)
    const error = useSelector(state => state.requestRoutes.error)
    const routeIsPending = useSelector(state => state.getRouteProperties.isPending)
    const routeError = useSelector(state => state.getRouteProperties.error)
    const showRouteEditor = useSelector(state => state.showRouteEditor.showEditor)
    const dispatch = useDispatch()

    useEffect(() => dispatch(requestRoutes()), [])
    //  useEffect(() => dispatch(setActiveRoute('')), [routes])

   // onSetRouteName = (event) => this.setState({routeName: event.target.value}) 
    // handleClose = () => this.setState({show: false, routeName: ""})
    // handleShow = () => this.setState({show: true})
    
    const handleSave = () => {
        axios.post(`${process.env.REACT_APP_API_URL}/addroute`, { route_name: routeName })
        .then(res => {
          console.log(res)
          dispatch(requestRoutes())
          dispatch(getRouteData())
          dispatch(setActiveRoute(routeName))
          setRouteName('')
        })
        .catch(err => console.log(err))         
    }

    const onDelete = (route_name) => {
        console.log(route_name)
        axios.post(`${process.env.REACT_APP_API_URL}/delroute`, { route_name })
        .then(res => {
            console.log("del route", res)
            setRouteName('')
            dispatch(requestRoutes())
            dispatch(getRouteData())
            dispatch(setActiveRoute(''))
        })
        .catch(err => console.log)
        
    }   

    return isPending ? <p>Loading</p> :
        (           
        <DropdownButton title={activeRoute || "Select Route"} onSelect={event => dispatch(setActiveRoute(event))} >      
                <AuthConsumer>
                {({ user }) => (
                    <Can
                        role={user.role}
                        perform="admin:visit"
                        yes={() => (
                            <div><Button variant="primary" size="sm" onClick={() => setShowEdit(!showEdit)}>{showEdit ? "Close" : "Edit"}</Button></div>                     
                        )}
                        no={() => null}               
                    />                            
                )}
                </AuthConsumer>  
            {
                routes.map((route, i) => {
                    return (
                        <div key={i} style={{display: "flex"}}>
                            <Dropdown.Item key={route.route_name} eventKey={route.route_name}>{route.route_name}</Dropdown.Item>
                            <Button style={{visibility: showEdit ? "initial" : "hidden", }} onClick={() => onDelete(route.route_name)}>delete</Button>
                        </div> 
                    )
                })
            }
            <div style={{visibility: showEdit ? "initial" : "hidden", display: "flex"}}>
                <FormControl size="sm" type="text" onChange={(event) => setRouteName(event.target.value)} placeholder="new route" value={routeName} />
                <Button size="sm" onClick={handleSave}>Save</Button>                
            </div>  
            {/* <Modal show={this.state.show} onHide={this.handleClose}>
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
            </Modal> */}
        </DropdownButton>
    
        )
}

export default RouteSelector