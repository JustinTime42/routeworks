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
    NEW_PROPERTY_SUCCESS,
    NEW_PROPERTY_PENDING,
    NEW_PROPERTY_FAILED,
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
    fetch('https://snowline-route-manager.herokuapp.com/api/routelist')
    .then(response => response.json())
    .then(data => dispatch({ type: REQUEST_ROUTES_SUCCESS, payload: data }))
    .catch(error => dispatch({ type: REQUEST_ROUTES_FAILED, payload: error }))
}

export const getRouteProperties = (activeRoute) => (dispatch) => {
    dispatch({ type: GET_ROUTE_PENDING})
    fetch(`https://snowline-route-manager.herokuapp.com/api/getroute/${activeRoute}`)
    .then(response => response.json())
    .then(data => {
        console.log("route properties:")
        console.log(data)
        dispatch({ type: GET_ROUTE_SUCCESS, payload: data })
    })
    .catch(error => dispatch({ type: GET_ROUTE_FAILED, payload: error }))
}

export const saveNewProperty = (property, allAddresses) => (dispatch) => {
    dispatch({ type: UPDATE_ADDRESSES_PENDING})
    fetch('https://snowline-route-manager.herokuapp.com/api/newproperty', {
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

export const deleteProperty = (property, allAddresses) => (dispatch) => {
    dispatch({ type: UPDATE_ADDRESSES_PENDING})
    fetch('https://snowline-route-manager.herokuapp.com/api/deleteproperty', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(property)
    })
    .then(res => res.json())
    .then(res => {
        console.log(res)
        allAddresses.splice(allAddresses.indexOf(property), 1)
        dispatch({ type: UPDATE_ADDRESSES_SUCCESS, payload: allAddresses})
    })
    .catch(err => dispatch({ type: UPDATE_ADDRESSES_FAILED, payload: err}))
}

export const editProperty = (property, allAddresses) => (dispatch) => {
    dispatch({ type: UPDATE_ADDRESSES_PENDING})
    let index = allAddresses.findIndex(item => item.key === property.key)
    allAddresses[index] = property
    console.log(allAddresses[index])
    dispatch({ type: UPDATE_ADDRESSES_SUCCESS, payload: allAddresses})
}

//currently not in use. refactor routeEditor.onSave to use
export const saveRoute = (newRoute) => (dispatch) => {
    dispatch({ type: SAVE_ROUTE_PENDING})
    fetch('https://snowline-route-manager.herokuapp.com/api/saveroute', {
        method: 'POST',     
        body: JSON.stringify({newRoute})
    })
    .then(response => response.json())
    .then(data => dispatch({ type: SAVE_ROUTE_SUCCESS, payload: data }))
    .catch(error => dispatch({ type: SAVE_ROUTE_FAILED, payload: error }))
}

export const getDrivers = () => (dispatch) => {
    dispatch({ type: GET_DRIVERS_PENDING })
    fetch('https://snowline-route-manager.herokuapp.com/api/drivers')
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
    fetch('https://snowline-route-manager.herokuapp.com/api/properties')
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