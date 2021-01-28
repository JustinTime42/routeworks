import { 
    SET_ACTIVE_ROUTE,
    REQUEST_ROUTES_PENDING,
    REQUEST_ROUTES_SUCCESS,
    REQUEST_ROUTES_FAILED, 
    SET_DRIVER_NAME,
    UPDATE_ADDRESSES_PENDING,
    UPDATE_ADDRESSES_SUCCESS,
    UPDATE_ADDRESSES_FAILED,
    GET_ROUTE_SUCCESS,
    GET_ROUTE_PENDING,
    GET_ROUTE_FAILED,
    SET_ACTIVE_PROPERTY,
    SAVE_ROUTE_SUCCESS,
    SAVE_ROUTE_PENDING,
    SAVE_ROUTE_FAILED,
    SHOW_ROUTE_EDITOR,
    SHOW_ROUTE,
    SET_TRACTOR_NAME,
    GET_DRIVERS_PENDING,
    GET_DRIVERS_SUCCESS,
    GET_DRIVERS_FAILED,
    GET_TRACTORS_PENDING,
    GET_TRACTORS_SUCCESS,
    GET_TRACTORS_FAILED,
} from './constants.js'
import { io } from "socket.io-client";
const socket = io('https://snowline-route-manager.herokuapp.com/')

export const setActiveRoute = (routeName) => {
    return {
        type: SET_ACTIVE_ROUTE,
        payload: routeName  
    }      
}

export const setActiveProperty = (property) => {
    return {
        type: SET_ACTIVE_PROPERTY,
        payload: property
    }
}
export const requestRoutes = () => (dispatch) => {
    dispatch({ type: REQUEST_ROUTES_PENDING })
    fetch(`${process.env.REACT_APP_API_URL}/routelist`)
    .then(response => response.json())
    .then(data => dispatch({ type: REQUEST_ROUTES_SUCCESS, payload: data }))
    .catch(error => dispatch({ type: REQUEST_ROUTES_FAILED, payload: error }))
}

export const getRouteProperties = (activeRoute) => (dispatch) => {
    dispatch({ type: GET_ROUTE_PENDING})
    fetch(`${process.env.REACT_APP_API_URL}/getroute/${activeRoute}`)
    .then(response => response.json())
    .then(data => {
        const routeProperties = data.filter(item => !item.inactive)
            .sort((a, b) => a.route_position > b.route_position ? 1 : -1) 
        dispatch({ type: GET_ROUTE_SUCCESS, payload: routeProperties })
    })
    .catch(error => dispatch({ type: GET_ROUTE_FAILED, payload: error }))
}

export const filterRouteProperties = (allAddresses, routeName, filter = '') => (dispatch) => {
    dispatch({ type: GET_ROUTE_PENDING})
    const routeProperties = allAddresses.filter(address => address.route_data.some(route => route.route_name === routeName )) 
        .sort((a, b) => a.route_position > b.route_position ? 1 : -1); 
    dispatch({ type: GET_ROUTE_SUCCESS, payload: routeProperties})
}

export const saveNewProperty = (property, allAddresses) => (dispatch) => {
    dispatch({ type: UPDATE_ADDRESSES_PENDING})
    fetch(`${process.env.REACT_APP_API_URL}/newproperty`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },   
        body: JSON.stringify(property)
    })
    .then(response => response.json())
    .then(res => {
        console.log(res)
        allAddresses.push(res[0])
        dispatch({ type: UPDATE_ADDRESSES_SUCCESS, payload: allAddresses})
    })
    .catch(error => dispatch({ type: UPDATE_ADDRESSES_FAILED, payload: error }))
}

export const deleteProperty = (property, allAddresses, routeName = null) => (dispatch) => {
    dispatch({ type: UPDATE_ADDRESSES_PENDING})
    fetch(`${process.env.REACT_APP_API_URL}/deleteproperty`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(property)
    })
    .then(res => res.json())
    .then(deleted => {
        allAddresses.splice(allAddresses.findIndex(item => item.key === deleted.key), 1)
        dispatch({ type: UPDATE_ADDRESSES_SUCCESS, payload: allAddresses})
        if (routeName) {
            dispatch(filterRouteProperties(allAddresses, routeName))
        }
    })
    .catch(err => dispatch({ type: UPDATE_ADDRESSES_FAILED, payload: err}))
}

export const editProperty = (property, allAddresses) => (dispatch) => {
    console.log(property)
    dispatch({ type: UPDATE_ADDRESSES_PENDING})
    fetch(`${process.env.REACT_APP_API_URL}/editproperty`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(property)
    })
    .then(res => res.json())
    .then(editted => {
        console.log(editted)
        let index = allAddresses.findIndex(item => item.key === editted.key)
        allAddresses[index] = editted
        dispatch({ type: SET_ACTIVE_PROPERTY, payload: editted})
        dispatch({ type: UPDATE_ADDRESSES_SUCCESS, payload: allAddresses})
        console.log("new property in address store: ", allAddresses[index])
    })
    .catch(err => dispatch({ type: UPDATE_ADDRESSES_FAILED, payload: err}))
}

//currently not in use. refactor routeEditor.onSave to use
export const saveRoute = (newRoute) => (dispatch) => {
    dispatch({ type: SAVE_ROUTE_PENDING})
    fetch(`${process.env.REACT_APP_API_URL}/saveroute`, {
        method: 'POST',     
        body: JSON.stringify({newRoute})
    })
    .then(response => response.json())
    .then(data => dispatch({ type: SAVE_ROUTE_SUCCESS, payload: data }))
    .catch(error => dispatch({ type: SAVE_ROUTE_FAILED, payload: error }))
}

export const getDrivers = () => (dispatch) => {
    dispatch({ type: GET_DRIVERS_PENDING })
    fetch(`${process.env.REACT_APP_API_URL}/drivers`)
    .then(res => res.json())
    .then(data => dispatch({ type: GET_DRIVERS_SUCCESS, payload: data}))
    .catch(err => dispatch({ type: GET_DRIVERS_FAILED, payload: err}))
}

export const setActiveDriver = (driver) => {    
    console.log(driver)
    return {
        type: SET_DRIVER_NAME,
        payload: driver
    }
}

export const setTractorName = (tractorName) => {
    console.log(tractorName)
    return {
        type: SET_TRACTOR_NAME,
        payload: tractorName
    }
}

export const getTractors = () => (dispatch) => {
    dispatch({ type: GET_TRACTORS_PENDING })
    fetch(`${process.env.REACT_APP_API_URL}/tractors`)
    .then(response => response.json())
    .then(data => {
        console.log("tractors", data)
        dispatch({ type: GET_TRACTORS_SUCCESS, payload: data })
    }) 
    .catch(error => dispatch({ type: GET_TRACTORS_FAILED, payload: error }))
}

export const getNewTractor = (newTractor, allTractors) => (dispatch) => {
    dispatch({ type: GET_TRACTORS_PENDING})
    console.log("all tractors:", allTractors)
        allTractors.push(newTractor)
        dispatch({ type: GET_TRACTORS_SUCCESS, payload: [...allTractors, newTractor]})
    };

export const sendNewTractor = (tractor) => (dispatch) => {
    dispatch({ type: GET_TRACTORS_PENDING})
    socket.emit('add-tractor', {"tractor_name": tractor}, newTractor => {
        console.log(newTractor)
        // allTractors.push(newTractor[0])
        // dispatch({ type: GET_TRACTORS_SUCCESS, payload: allTractors})
    });
 

    // fetch(`${process.env.REACT_APP_API_URL}/newtractor`, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },   
    //     body: JSON.stringify({"tractor_name": tractor})
    // })
    // .then(response => response.json())
    // .then(res => {
    //     console.log("response", res)
    //     allTractors.push(res[0])
        
    // })
    // .catch(error => dispatch({ type: GET_TRACTORS_FAILED, payload: error }))
}

export const deleteTractor = (tractor, allTractors) => (dispatch) => {
    console.log("tractor to delete:", tractor)
    console.log("allTractors:", allTractors)
    dispatch({ type: GET_TRACTORS_PENDING})
    fetch(`${process.env.REACT_APP_API_URL}/deleteTractor`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({"tractor_name": tractor})
    })
    .then(res => res.json())
    .then(deleted => {
        allTractors.splice(allTractors.findIndex(item => item.tractor_name === deleted), 1)
        dispatch({ type: GET_TRACTORS_SUCCESS, payload: allTractors})
    })
    .catch(err => dispatch({ type: GET_TRACTORS_FAILED, payload: err}))
}

export const requestAllAddresses = () => (dispatch) => {
    dispatch({ type: UPDATE_ADDRESSES_PENDING })
    fetch(`${process.env.REACT_APP_API_URL}/properties`)
    .then(response => response.json())
    .then(data => dispatch({ type: UPDATE_ADDRESSES_SUCCESS, payload: data}))
    .catch(error => dispatch({ type: UPDATE_ADDRESSES_FAILED, payload: error}))
}

export const showRouteEditor = (show) => {
    return {
        type: SHOW_ROUTE_EDITOR,
        payload: show
    }
}

export const showRoute = (show) => {
    return {
        type: SHOW_ROUTE, 
        payload: show
    }
}