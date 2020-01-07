import { 
    SET_ACTIVE_ROUTE,
    REQUEST_ROUTES_PENDING,
    REQUEST_ROUTES_SUCCESS,
    REQUEST_ROUTES_FAILED, 
    SET_DRIVER_NAME,
    REQUEST_ADDRESSES_PENDING,
    REQUEST_ADDRESSES_SUCCESS,
    REQUEST_ADDRESSES_FAILED,
    GET_ROUTE_SUCCESS,
    GET_ROUTE_PENDING,
    GET_ROUTE_FAILED,
    SET_ACTIVE_PROPERTY,
    SAVE_ROUTE_SUCCESS,
    SAVE_ROUTE_PENDING,
    SAVE_ROUTE_FAILED,
    SHOW_ROUTE_EDITOR,
    SHOW_ROUTE,
    SET_TRACTOR_NAME
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
    .then(data => dispatch({ type: GET_ROUTE_SUCCESS, payload: data }))
    .catch(error => dispatch({ type: GET_ROUTE_FAILED, payload: error }))
}

//currently not in use. consider removing
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

export const setDriverName = (driverName) => {
    return {
        type: SET_DRIVER_NAME,
        payload: driverName
    }
}

export const setTractorName = (tractorName) => {
    return {
        type: SET_TRACTOR_NAME,
        payload: tractorName
    }
}

export const requestAllAddresses = () => (dispatch) => {
    dispatch({ type: REQUEST_ADDRESSES_PENDING })
    fetch('https://snowline-route-manager.herokuapp.com/api/properties')
    .then(response => response.json())
    .then(data => dispatch({ type: REQUEST_ADDRESSES_SUCCESS, payload: data}))
    .catch(error => dispatch({ type: REQUEST_ADDRESSES_FAILED}))
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