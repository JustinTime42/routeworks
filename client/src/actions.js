import { 
    SET_ACTIVE_ROUTE,
    REQUEST_ROUTES_PENDING,
    REQUEST_ROUTES_SUCCESS,
    REQUEST_ROUTES_FAILED, 
    SET_DRIVER_NAME,
    REQUEST_ADDRESSES_PENDING,
    REQUEST_ADDRESSES_SUCCESS,
    REQUEST_ADDRESSES_FAILED
} from './constants.js'

export const setActiveRoute = (routeName) => {
    return {
        type: SET_ACTIVE_ROUTE,
        payload: routeName  
    }      
}

export const requestRoutes = () => (dispatch) => {
    dispatch({ type: REQUEST_ROUTES_PENDING })
    fetch('https://snowline-route-manager.herokuapp.com/api/routelist')
    .then(response => response.json())
    .then(data => dispatch({ type: REQUEST_ROUTES_SUCCESS, payload: data}))
    .catch(error => dispatch({ type: REQUEST_ROUTES_FAILED, payload: error }))
}

export const setDriverName = (driverName) => {
    return {
        type: SET_DRIVER_NAME,
        payload: driverName
    }
}

export const requestAllAddresses = () => (dispatch) => {
    dispatch({ type: REQUEST_ADDRESSES_PENDING })
    fetch('https://snowline-route-manager.herokuapp.com/api/properties')
    .then(response => response.json())
    .then(data => dispatch({ type: REQUEST_ADDRESSES_SUCCESS, payload: data}))
    .catch(error => dispatch({ type: REQUEST_ADDRESSES_FAILED}))
}
