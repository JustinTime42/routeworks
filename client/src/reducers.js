import { SET_ACTIVE_ROUTE, 
    REQUEST_ROUTES_PENDING,
    REQUEST_ROUTES_SUCCESS,
    REQUEST_ROUTES_FAILED,
    SET_DRIVER_NAME
} from './constants.js'

const initialStateActiveRoute = {
    activeRoute: '' 
}

export const setActiveRoute = (state=initialStateActiveRoute, action={}) => {
    switch(action.type) {
        case SET_ACTIVE_ROUTE:
            return {...state, activeRoute: action.payload }
        default:    
            return state
    }
}

const initialStateRoutes = {
    isPending: false,
    routes: [], 
    error: ''
}

export const requestRoutes = (state = initialStateRoutes, action={}) => {
    switch(action.type) {
        case REQUEST_ROUTES_PENDING: 
            return {...state, isPending: true}
        case REQUEST_ROUTES_SUCCESS:
            return {...state, routes: action.payload, isPending: false}
        case REQUEST_ROUTES_FAILED:
            return {...state, error: action.payload, isPending: false}
        default:
            return state
    }
}

const initialStateDriver = {
    driverName: ''
}

export const setDriverName = (state = initialStateDriver, action={}) => {
    switch(action.type) {
        case SET_DRIVER_NAME:
            return {...state, driverName: action.payload}
        default:
            return state
    }
}