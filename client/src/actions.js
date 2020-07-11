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
} from './constants.js'

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
        console.log("route properties:")
        console.log(data)
        const routeProperties = data.filter(item => !item.inactive)
            .sort((a, b) => a.route_data.find(item => item.route_name === activeRoute).route_position > b.route_data.find(item => item.route_name === activeRoute).route_position ? 1 : -1) 
        dispatch({ type: GET_ROUTE_SUCCESS, payload: routeProperties })
    })
    .catch(error => dispatch({ type: GET_ROUTE_FAILED, payload: error }))
}

export const filterRouteProperties = (allAddresses, routeName) => (dispatch) => {
    dispatch({ type: GET_ROUTE_PENDING})
    const routeProperties = allAddresses.filter(address => address.route_data.some(route => route.route_name === routeName )) 
        .sort((a, b) => a.route_data.find(item => item.route_name === routeName).route_position > b.route_data.find(item => item.route_name === routeName).route_position ? 1 : -1); 
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
    return {
        type: SET_TRACTOR_NAME,
        payload: tractorName
    }
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