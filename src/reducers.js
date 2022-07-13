import { SET_ACTIVE_ROUTE, 
    REQUEST_ROUTES_PENDING,
    REQUEST_ROUTES_SUCCESS,
    REQUEST_ROUTES_FAILED,
    SET_ACTIVE_DRIVER,
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
    SET_ACTIVE_TRACTOR,
    NEW_PROPERTY_SUCCESS,
    NEW_PROPERTY_PENDING,
    NEW_PROPERTY_FAILED,
    DEL_PROPERTY_SUCCESS,
    DEL_PROPERTY_PENDING,
    DEL_PROPERTY_FAILED,
    GET_DRIVERS_PENDING,
    GET_DRIVERS_SUCCESS,
    GET_DRIVERS_FAILED,
    GET_ITEMS_PENDING,
    GET_TRACTORS_SUCCESS,
    GET_ITEMS_FAILED,
    ROUTE_DATA_PENDING,
    ROUTE_DATA_SUCCESS,
    ROUTE_DATA_FAILED,
    FILTER_PROPERTIES_SUCCESS,
    GET_VEHICLE_TYPES_PENDING,
    GET_VEHICLE_TYPES_SUCCESS,
    GET_VEHICLE_TYPES_FAILED,
    SET_ACTIVE_VEHICLE_TYPE,
    SET_CURRENT_USER,
    TIMER_IS_RUNNING,
    GET_WORK_TYPES_SUCCESS,
    GET_WORK_TYPES_PENDING,
    GET_WORK_TYPES_FAILED,
    SET_WORK_TYPE,
    SHOW_MODAL,
    HIDE_MODAL,
    TEMP_ITEM  
} from './constants.js'

const initialStateCurrentUser = {
    currentUser: {
        admin: false
    }
}

export const setCurrentUser = (state=initialStateCurrentUser, action={}) => {
    switch(action.type) {
        case SET_CURRENT_USER:
            return {...state, currentUser: action.payload }
        default:
            return state 

    }
}

const initialStateTimerIsRunning = {
    timerIsRunning: false
}

export const setTimerIsRunning = (state=initialStateTimerIsRunning, action={}) => {
    switch(action.type) {
        case TIMER_IS_RUNNING:
            return {...state, timerIsRunning: action.payload}
        default: 
            return state
    }
}

const initialStateActiveRoute = {
    activeRoute: {
        name: ''
    }
}

export const setActiveRoute = (state=initialStateActiveRoute, action={}) => {
    switch(action.type) {
        case SET_ACTIVE_ROUTE:       
            if (!action.payload) {return {...state, ...initialStateActiveRoute}}   
            else return {...state, ...initialStateActiveProperty, activeRoute: action.payload}
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
    driver: {
        name: '',
        percentage: '',
        hourly: '',
    }
}

export const setActiveDriver = (state = initialStateDriver, action={}) => {
    switch(action.type) {
        case SET_ACTIVE_DRIVER:
            if (!action.payload) {return {...state, ...initialStateDriver}} 
            else return {...state, driver: action.payload}
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

const initialStateActiveTractor = {
    activeTractor: {
        name: '',
        type: 0,
    }
}

export const setActiveTractor = (state = initialStateActiveTractor, action={}) => {
    switch(action.type) {
        case SET_ACTIVE_TRACTOR:
            if (!action.payload) {return {...state, ...initialStateActiveTractor}} 
            else {
                //setActiveVehicleType()
                return {...state, activeTractor: action.payload}
            } 
        default: 
            return state
    }
}

const initialStateWorkTypes = {
    isPending: false,
    allWorkTypes: [],
    error: ''
}

export const getWorkTypes = (state = initialStateWorkTypes, action={}) => {
    switch(action.type) {
        case GET_WORK_TYPES_PENDING:
            return {...state, isPending: true}
        case GET_WORK_TYPES_SUCCESS:
            return {...state, allWorkTypes: action.payload, isPending: false}
        case GET_WORK_TYPES_FAILED:
            return {...state, error: action.payload, isPending: false}
        default: 
            return state
    }
}

const initialStateActiveWorkType = {
    workType: {
        name: '',
    }
}

export const setActiveWorkType = (state = initialStateActiveWorkType, action={}) => {
    switch(action.type) {
        case SET_WORK_TYPE:
            if (!action.payload) {return {...state, ...initialStateActiveWorkType}} 
            return {...state, workType: action.payload}
        default:
            return state
    }
}

const initialStateTractors = {
    isPending: false,
    allTractors: [],
    error: ''    
}
export const getTractors = (state = initialStateTractors, action={}) => {
    switch(action.type) {
        case GET_ITEMS_PENDING: 
            return {...state, isPending: true}
        case GET_TRACTORS_SUCCESS:
            return {...state, allTractors: action.payload, isPending: false}
        case GET_ITEMS_FAILED:
            return {...state, error: action.payload, isPending: false}
        default:
            return state
    }
}

const initialStateTractorTypes = {
    tractorTypes: [],
    isPending: false, 
    error: ''
}

export const getTractorTypes = (state = initialStateTractorTypes, action={}) => {
    switch(action.type) {
        case GET_VEHICLE_TYPES_PENDING:
            return{...state, isPending: true}
        case GET_VEHICLE_TYPES_SUCCESS:
            return {...state, tractorTypes: action.payload, isPending: false}
        case GET_VEHICLE_TYPES_FAILED:
            return {...state, error: action.payload, isPending: false}
        default: 
            return state
    }
}

const initialStateActiveVehicleType = {
    activeVehicleType: {
        name: '',
    }
}

export const setActiveVehicleType = (state=initialStateActiveVehicleType, action={}) => {
    switch(action.type) {
        case SET_ACTIVE_VEHICLE_TYPE:
            return {...state, activeVehicleType: action.payload }
        default:    
            return state
    }
}

const initialStateAllAddresses = {
    addresses: [],
    isPending: false,
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

export const initialStateRouteData = {
    routeData: [],
    isPending: false,
    error:''
}

export const getRouteData = (state = initialStateRouteData, action={}) => {
    switch(action.type) {
        case ROUTE_DATA_PENDING:
            return {...state, isPending: true}
        case ROUTE_DATA_SUCCESS:
            return {...state, routeData: action.payload, isPending: false}
        case ROUTE_DATA_FAILED:
            return {...state, error: action.payload, isPending: false}
        default:
            return state
    }
}

export const initialStateRouteProperties = {
    addresses: [],
    isPending: false,
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

export const initialStateFilteredProperties = {
    customers: [],
}

export const filterProperties = (state = initialStateFilteredProperties, action={}) => {
    switch(action.type) {
        case FILTER_PROPERTIES_SUCCESS: 
            return {...state, customers: action.payload}
        default: return state
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

export const initialStateWhichModals = {
    modals: []
}

export const whichModals = (state = initialStateWhichModals, action={}) =>  {
    switch(action.type) {
        case SHOW_MODAL:
            return {...state, modals: [...state.modals, action.payload]}
        case HIDE_MODAL:
            return {...state, modals: state.modals.filter(item => item !== action.payload)}
        default:
            return state
    }
}

export const initialStateTempItem = {
    item: {}
}

export const setTempItem = (state = initialStateTempItem, action={}) => {
    switch(action.type) {
        case TEMP_ITEM:
            return {...state, item: action.payload} 
        default:
            return state
    }
}