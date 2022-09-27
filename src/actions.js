import { addDoc, collection, doc, setDoc, deleteDoc } from "firebase/firestore"; 
import {db} from './firebase'
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
    SET_LOG_ENTRIES,
} from './constants.js'

export const setCurrentUser = (currentUser) => {
    return {
        type: SET_CURRENT_USER,
        payload: currentUser
    }
}

export const setTimerIsRunning = (isRunning) => {
    return {
        type: TIMER_IS_RUNNING,
        payload: isRunning
    }
}

export const getRouteData = () => (dispatch) => {
    dispatch({ type: ROUTE_DATA_PENDING })
    fetch(`${process.env.REACT_APP_API_URL}/routedata`)
    .then(response => response.json())
    .then(data => dispatch({ type: ROUTE_DATA_SUCCESS, payload: data }))
    .catch(error => dispatch({ type: ROUTE_DATA_FAILED, payload: error }))
}

export const filterRouteProperties = (allAddresses, routeName, filter = '') => (dispatch) => {
    dispatch({ type: GET_ROUTE_PENDING})
    const routeProperties = allAddresses.filter(address => address.route_data.some(route => route.route_name === routeName )) 
        .sort((a, b) => a.route_position > b.route_position ? 1 : -1); 
    dispatch({ type: GET_ROUTE_SUCCESS, payload: routeProperties})
}

export const filterProperties = (matches) => {
    return {
        type: FILTER_PROPERTIES_SUCCESS,
        payload: matches
    }    
}

export const setLogs = (entries) => {
    return {
        type: SET_LOG_ENTRIES,
        payload: entries
    }
}

export const createItem = (item, itemList = null, className, activeActionType = null, listAction = null) => (dispatch) => {
    console.log(item)
    dispatch({type: activeActionType, payload: item})
    // if (item.adminFields) {
    //     let tempList = [...itemList]            
    //     tempList.push(item.nonAdminFields ? item.nonAdminFields : item)
    //     dispatch({type: listAction, payload: tempList})
    // }
    const sendToDB = async() => {
        try {
           // const docRef = await addDoc(collection(db, className), {...item})  
            addDoc(collection(db, className), {...item}) 
            .then(result => {
                console.log(result.id)
                dispatch({
                    type: activeActionType,                     
                    payload: {...item, id: result.id}
                }) 
            })
                              
       } catch (e) {
         alert("Error adding document: ", e);
       }
    }
    sendToDB()
}

export const editItem = (item, itemList, className, activeActionType = null, listAction = null, merge = true) => (dispatch) => {
    dispatch({type: activeActionType, payload: item.nonAdminFields ? item.nonAdminFields : item})    
    if (item.adminFields) {
        let tempList = [...itemList]
        tempList[tempList.findIndex(i => i.admin_key === item.id)] = item.nonAdminFields
        dispatch({type: listAction, payload: tempList})
    }    
    console.log(item)
    const {id, ...itemDetails} = item
    const itemRef = doc(db, className, item.id)    
    const sendToDB = async() => {
        try {            
            await setDoc(itemRef, itemDetails, {merge: merge})
            console.log("success")
        } catch (e) { console.log("error adding document: ", e)}
    }
    sendToDB()
}

export const deleteItem = (item, itemList, className, activeActionType, listAction) => (dispatch) => {
    dispatch({type: activeActionType, payload: null}) 
    let tempList = [...itemList]   
    if (item.adminFields) {        
        tempList.splice(tempList.findIndex(i => i.admin_key === item.id), 1)
        dispatch({type: listAction, payload: tempList}) 
    }     
    tempList.splice(tempList.findIndex(i => i.id === item.id), 1)
    dispatch({type: listAction, payload: tempList})
    deleteDoc(doc(db, className, item.id))
    .then(() => dispatch({type: activeActionType, payload: null}))
    .catch(err => console.log(err))
}

export const setActiveItem = (item, itemArray, actionType) => {
    const activeItem = itemArray.find(i => i.name === item)
    if (activeItem) {
        return {
            type: actionType,
            payload: activeItem
        }
    }
    else {
        return {
            type: actionType,
            payload: item
        }
    }

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

export const showModal = (which) => {
    return {
        type: SHOW_MODAL,
        payload: which
    }
}

export const hideModal = (which) => {
    return {
        type: HIDE_MODAL,
        payload: which
    }
}

export const setTempItem = (item) => {
    return {
        type: TEMP_ITEM,
        payload: item
    }
}


