import { SET_ACTIVE_ROUTE, 
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
    SAVE_ROUTE_FAILED
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

const initialStateActiveProperty = {
    activeProperty: {}
}

export const setActiveProperty = (state=initialStateActiveProperty, action={}) => {
    switch(action.type) {
        case SET_ACTIVE_PROPERTY: 
            return{...state, activeProperty: action.payload }
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

const initialStateAllAddresses = {
    addresses: [],
    isPending: true,
    error: ''
}

export const requestAllAddresses = (state = initialStateAllAddresses, action={}) => {
    switch(action.type) {
        case REQUEST_ADDRESSES_PENDING: 
            return {...state, isPending: true}
        case REQUEST_ADDRESSES_SUCCESS:
            return {...state, addresses: action.payload, isPending: false}
        case REQUEST_ADDRESSES_FAILED:
            return {...state, error: action.payload, isPending: false}
        default:
            return state
    }
}

export const initialStateRouteProperties = {
    addresses: [],
    isPending: true,
    error: ''
}
export const getRouteProperties = (state = initialStateRouteProperties, action={}) => {
    switch(action.type) {
        case GET_ROUTE_PENDING: 
            return {...state, isPending: true}
        case GET_ROUTE_SUCCESS:
            return {...state, addresses: action.payload, isPending: false}
        case GET_ROUTE_FAILED:
            return {...state, error: action.payload, isPending: false}
        default:
            return state
    }
}

export const saveRoute = (state, action={}) => {
    switch(action.type) {
        case SAVE_ROUTE_PENDING:
            return {...state, isPending: true}
        case SAVE_ROUTE_SUCCESS:
            return {...state, addresses: action.payload, isPending: false}
        case SAVE_ROUTE_FAILED: 
            return {...state, error: action.payload, isPending: false}
    }
}