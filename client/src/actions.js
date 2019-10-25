import { 
    SET_ACTIVE_ROUTE,
    REQUEST_ROUTES_PENDING,
    REQUEST_ROUTES_SUCCESS,
    REQUEST_ROUTES_FAILED
} from './constants.js'

export const setActiveRoute = (routeName) => {
    console.log(routeName)
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