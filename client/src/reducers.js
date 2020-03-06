import { SET_ACTIVE_ROUTE, 
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
    DEL_PROPERTY_SUCCESS,
    DEL_PROPERTY_PENDING,
    DEL_PROPERTY_FAILED,
    GET_DRIVERS_PENDING,
    GET_DRIVERS_SUCCESS,
    GET_DRIVERS_FAILED,
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
    activeProperty: null
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
    driver: {
        key: '',
        name: '',
        percentage: ''
    }
}

export const setActiveDriver = (state = initialStateDriver, action={}) => {
    switch(action.type) {
        case SET_DRIVER_NAME:
            return {...state, driver: action.payload}
        default:
            return state
    }
}

const initialStateDrivers = {
    isPending: false,
    drivers: [],
    error: ''    
}

export const getDrivers = (state = initialStateDrivers, action={}) => {
    switch(action.type) {
        case GET_DRIVERS_PENDING: 
            return {...state, isPending: true}
        case GET_DRIVERS_SUCCESS:
            return {...state, drivers: action.payload, isPending: false}
        case GET_DRIVERS_FAILED:
            return {...state, error: action.payload, isPending: false}
        default:
            return state
    }
}

const initialStateTractor = {
    tractorName: ''
}

export const setTractorName = (state = initialStateTractor, action={}) => {
    switch(action.type) {
        case SET_TRACTOR_NAME:
            return {...state, tractorName: action.payload}
        default: 
            return state
    }
}

// const initialStateNewProperty = {
//     addresses: {},
//     isPending: false,
//     error: ''
// }

// export const saveNewProperty = (state = initialStateNewProperty, action={}) => {
//     switch(action.type) {
//         case NEW_PROPERTY_PENDING:
//             return {...state, isPending: true}
//         // case NEW_PROPERTY_SUCCESS: 
//         //     return {...state, addresses: action.payload, isPending: false}
//         case NEW_PROPERTY_FAILED:
//             return {...state, error: action.payload, isPending: false}
//         default:
//             return state
//     }
// }

const initialStateAllAddresses = {
    addresses: [],
    isPending: true,
    error: ''
}

export const requestAllAddresses = (state = initialStateAllAddresses, action={}) => {
    switch(action.type) {
        case UPDATE_ADDRESSES_PENDING: 
            return {...state, isPending: true}
        case UPDATE_ADDRESSES_SUCCESS:
            return {...state, addresses: action.payload, isPending: false}
        case UPDATE_ADDRESSES_FAILED:
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

export const initialStateSaveRoute = {
    addresses: [],
    isPending: true,
    error: ''
}

export const saveRoute = (state = initialStateSaveRoute, action={}) => {
    switch(action.type) {
        case SAVE_ROUTE_PENDING:
            return {...state, isPending: true}
        case SAVE_ROUTE_SUCCESS:
            return {...state, addresses: action.payload, isPending: false}
        case SAVE_ROUTE_FAILED: 
            return {...state, error: action.payload, isPending: false}
        default: 
            return state
    }
}

export const initialStateShowRouteEditor = {
    showEditor: false
}

export const showRouteEditor = (state = initialStateShowRouteEditor, action={}) => {
    switch(action.type) {
        case SHOW_ROUTE_EDITOR:
            return {...state, showEditor: action.payload}
        default: 
            return state
    }    
}

export const initialStateShowRoute = {
    showRoute: false
}

export const showRoute = (state = initialStateShowRoute, action={}) => {
    switch(action.type) {
        case SHOW_ROUTE: 
            return {...state, showRoute: action.payload}
        default:
            return state
    }
}