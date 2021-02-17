import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import axios from "axios"
import { Dropdown, DropdownButton, Button, FormControl } from "react-bootstrap"
import Can from "../auth/Can"
import { AuthConsumer } from "../authContext"
import { setActiveRoute, requestRoutes, getRouteData } from "../actions"

const editStyle = {
    float: "right"
} // future feature

const RouteSelector = () => {
    const [showEdit, setShowEdit] = useState(false)
    const [routeName, setRouteName] = useState("")
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routes = useSelector(state => state.requestRoutes.routes)
    const isPending = useSelector(state => state.requestRoutes.isPending)
    const dispatch = useDispatch()

    useEffect(() => dispatch(requestRoutes()), [])
    
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
        </DropdownButton>    
        )
}

export default RouteSelector