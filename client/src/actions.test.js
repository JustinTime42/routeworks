import * as actions from './actions'
import { 
    SET_ACTIVE_ROUTE,
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
    SET_CURRENT_USER,
    TIMER_IS_RUNNING,
    SET_ACTIVE_VEHICLE_TYPE,
    GET_WORK_TYPES_SUCCESS,
    GET_WORK_TYPES_PENDING,
    GET_WORK_TYPES_FAILED,
    SET_WORK_TYPE,
    SHOW_MODAL,
    HIDE_MODAL,
    TEMP_ITEM,
} from './constants.js'

import configureMockStore from 'redux-mock-store'
import ThunkMiddleware from 'redux-thunk'

const mockStore = configureMockStore([ThunkMiddleware])

describe('setActiveItem', () => {
    it('should return active item as object from given array for SET_ACTIVE_DRIVER', () => {
        const givenArray = [
            {key: 1, name: 'name one'},
            {key: 2, name: 'name two'},
            {key: 3, name: 'name three'},
        ]   
        const activeItem = 'name two'
        const expectedAction = {
            type: SET_ACTIVE_DRIVER,
            payload: givenArray[1]
        }     
        expect(actions.setActiveItem(activeItem, givenArray, SET_ACTIVE_DRIVER))
        .toEqual(expectedAction)
        
    })
})

describe('getDrivers action', () => {
    it('should initially dispatch GET_DRIVERS_PENDING', () => {
        const store = mockStore()
        store.dispatch(actions.getDrivers())
        const action = store.getActions()
        const expectedAction = { type: GET_DRIVERS_PENDING}
        expect(action[0]).toEqual(expectedAction)
    })
})

//next implement an asynchronous action test like getDrivers
