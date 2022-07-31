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
} from './constants.js'
// import { io } from "socket.io-client";
// const socket = io('https://snowline-route-manager.herokuapp.com/')

export const setCurrentUser = (currentUser) => {
    return {
        type: SET_CURRENT_USER,
        payload: currentUser
    }
}

export const setActiveRoute = (route) => {
    return {
        type: SET_ACTIVE_ROUTE,
        payload: route
    }      
}

export const setTimerIsRunning = (isRunning) => {
    return {
        type: TIMER_IS_RUNNING,
        payload: isRunning
    }
}

export const setActiveProperty = (property) => (dispatch) => {
    if (!property) {
        console.log(property)
        dispatch({type: SET_ACTIVE_PROPERTY, payload: property })
    } else {
        console.log(property)
        dispatch({ type: SET_ACTIVE_PROPERTY, payload: property })
        // fetch(`${process.env.REACT_APP_API_URL}/custdetail/${property.key}`)
        // .then(res => res.json())
        // .then(details => {
        //     let temp = {...property, ...details[0]}
        //     dispatch({type: SET_ACTIVE_PROPERTY, payload: temp })
        // })
        // .catch(error => console.log(error))
    }
}

//deprecated see SimpleSelector
export const requestRoutes = (results) => (dispatch) => {
    dispatch({ type: REQUEST_ROUTES_PENDING })
    return {
        type: REQUEST_ROUTES_SUCCESS,
        payload: results
    }
    // fetch(`${process.env.REACT_APP_API_URL}/routelist`)
    // .then(response => response.json())
    // .then(data => dispatch({ type: REQUEST_ROUTES_SUCCESS, payload: data }))
    // .catch(error => dispatch({ type: REQUEST_ROUTES_FAILED, payload: error }))
}

export const deleteRoute = (route) => (dispatch) => {
    console.log(route)
    dispatch({ type: REQUEST_ROUTES_PENDING })
    fetch(`${process.env.REACT_APP_API_URL}/delroute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },           
        body: JSON.stringify(route)
    })
}

export const getRouteData = () => (dispatch) => {
    dispatch({ type: ROUTE_DATA_PENDING })
    fetch(`${process.env.REACT_APP_API_URL}/routedata`)
    .then(response => response.json())
    .then(data => dispatch({ type: ROUTE_DATA_SUCCESS, payload: data }))
    .catch(error => dispatch({ type: ROUTE_DATA_FAILED, payload: error }))
}

// actually let's not use that for now...
export const getRouteProperties = (addresses, routeData, activeRoute) => (dispatch) => {
    let routeProperties = []
    dispatch({ type: GET_ROUTE_PENDING})
    routeData.forEach(routeEntry => {
        if (routeEntry.route_name === activeRoute) {
            let customer = addresses.find(property => property.key === routeEntry.property_key)
            routeProperties.push({...customer, route_position: routeEntry.route_position})
        }
    })
    routeProperties.sort((a, b) => a.route_position > b.route_position ? 1 : -1) 
    dispatch({ type: GET_ROUTE_SUCCESS, payload: routeProperties })    
    
    // dispatch({ type: GET_ROUTE_PENDING})
    // fetch(`${process.env.REACT_APP_API_URL}/getroute/${activeRoute}`)
    // .then(response => response.json())
    // .then(data => {
    //     const routeProperties = data.filter(item => !item.inactive)
    //         .sort((a, b) => a.route_position > b.route_position ? 1 : -1) 
    //     dispatch({ type: GET_ROUTE_SUCCESS, payload: routeProperties })
    // })
    // .catch(error => dispatch({ type: GET_ROUTE_FAILED, payload: error }))
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



export const saveNewProperty = (property, allAddresses) => (dispatch) => {
    dispatch({ type: UPDATE_ADDRESSES_PENDING})
    fetch(`${process.env.REACT_APP_API_URL}/newproperty`, {
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

export const deleteProperty = (property, allAddresses, routeData, routeName = null) => (dispatch) => {
    dispatch({ type: UPDATE_ADDRESSES_PENDING})
    fetch(`${process.env.REACT_APP_API_URL}/deleteproperty`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(property)
    })
    .then(res => res.json())
    .then(deleted => {
        let newAddresses = [...allAddresses]
        newAddresses.splice(newAddresses.findIndex(item => item.key === deleted.key), 1)
        let newRouteData = routeData.filter(entry => entry.property_key !== property.key)
        console.log(newRouteData)
        dispatch({ type: ROUTE_DATA_SUCCESS, payload: newRouteData })
        dispatch({ type: UPDATE_ADDRESSES_SUCCESS, payload: newAddresses})
        if (routeName) {
            dispatch(filterRouteProperties(newAddresses, routeName))
        }
    })
    .catch(err => dispatch({ type: UPDATE_ADDRESSES_FAILED, payload: err}))
}

export const editProperty = (property, allAddresses) => (dispatch) => {
    console.log(property)
    dispatch({ type: UPDATE_ADDRESSES_PENDING})
    fetch(`${process.env.REACT_APP_API_URL}/editproperty`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(property)
    })
    .then(res => res.json())
    .then(editted => {
        console.log(editted)
        let index = allAddresses.findIndex(item => item.key === editted.key)
        allAddresses[index] = editted
        dispatch({ type: SET_ACTIVE_PROPERTY, payload: allAddresses[index]})
        dispatch({ type: UPDATE_ADDRESSES_SUCCESS, payload: allAddresses})
        console.log("new property in address store: ", allAddresses[index])
    })
    .catch(err => dispatch({ type: UPDATE_ADDRESSES_FAILED, payload: err}))
}

//currently not in use. refactor routeEditor.onSave to use
export const saveRoute = (newRoute) => (dispatch) => {
    dispatch({ type: SAVE_ROUTE_PENDING})
    fetch(`${process.env.REACT_APP_API_URL}/saveroute`, {
        method: 'POST',     
        body: JSON.stringify({newRoute})
    })
    .then(response => response.json())
    .then(data => dispatch({ type: SAVE_ROUTE_SUCCESS, payload: data }))
    .catch(error => dispatch({ type: SAVE_ROUTE_FAILED, payload: error }))
}

export const getDrivers = () => (dispatch) => {
    dispatch({ type: GET_DRIVERS_PENDING })
    fetch(`${process.env.REACT_APP_API_URL}/drivers`)
    .then(res => res.json())
    .then(data => dispatch({ type: GET_DRIVERS_SUCCESS, payload: data}))
    .catch(err => dispatch({ type: GET_DRIVERS_FAILED, payload: err}))
}

// export const setActiveDriver = (driver) => {    
//     console.log(driver)
//     return {
//         type: SET_ACTIVE_DRIVER,
//         payload: driver
//     }
// }

// export const setActiveTractor = (tractor, allTractors) => {
//     console.log(tractor)
//     const activeTractor = allTractors.find(item => item.name === tractor)
//     return {
//         type: SET_ACTIVE_TRACTOR,
//         payload: activeTractor
//     }
// }

export const getTractors = () => (dispatch) => {
    dispatch({ type: GET_ITEMS_PENDING })
    fetch(`${process.env.REACT_APP_API_URL}/vehicles`)
    .then(response => response.json())
    .then(data => {
        console.log("tractors", data)
        dispatch({ type: GET_TRACTORS_SUCCESS, payload: data })
    }) 
    .catch(error => dispatch({ type: GET_ITEMS_FAILED, payload: error }))
}

export const getTractorTypes = () => (dispatch) => {
    dispatch({type: GET_VEHICLE_TYPES_PENDING})
    fetch(`${process.env.REACT_APP_API_URL}/vehicletypes`)
    .then(res => res.json())
    .then(data => dispatch({type: GET_VEHICLE_TYPES_SUCCESS, payload: data}))
    .catch(err => dispatch({type: GET_VEHICLE_TYPES_FAILED, payload: err}))
}

export const getWorkTypes = () => (dispatch) => {
    dispatch({type: GET_WORK_TYPES_PENDING})
    fetch(`${process.env.REACT_APP_API_URL}/worktypes`)
    .then(res => res.json())
    .then(data => dispatch({type: GET_WORK_TYPES_SUCCESS, payload: data}))
    .catch(err => dispatch({type: GET_WORK_TYPES_FAILED, payload: err}))
}

export const createItem = (item, itemList, className, activeActionType, listAction) => (dispatch) => {
    dispatch({type: activeActionType, payload: item.nonAdminFields ? item.nonAdminFields : item})
    if (item.adminFields) {
        let tempList = [...itemList]            
        tempList.push(item.nonAdminFields ? item.nonAdminFields : item)
        dispatch({type: listAction, payload: tempList})
    }
    const sendToDB = async() => {
        try {
            const docRef = await addDoc(collection(db, className), {...item})                     
       } catch (e) {
         alert("Error adding document: ", e);
       }
    }
    sendToDB()
}

export const editItem = (item, itemList, className, activeActionType, listAction) => (dispatch) => {
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
            await setDoc(itemRef, {...itemDetails}, {merge: true})
        } catch (e) { console.log("error adding document: ", e)}
    }
    sendToDB()
}

export const deleteItem = (item, itemList, className, activeActionType, listAction) => (dispatch) => {
    dispatch({type: activeActionType, payload: null})    
    if (item.adminFields) {
        let tempList = [...itemList]
        tempList.splice(tempList.findIndex(i => i.admin_key === item.id), 1)
        dispatch({type: listAction, payload: tempList}) 
    }     
    deleteDoc(doc(db, className, item.id))
    .then(() => dispatch({type: activeActionType, payload: null}))
    .catch(err => console.log(err))
}

export const setActiveItem = (item, itemArray, actionType) => {
    console.log(itemArray)
    const activeItem = itemArray.find(i => i.name === item)
    console.log("activeItem ", activeItem)
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

export const requestAllAddresses = () => (dispatch) => {
    dispatch({ type: UPDATE_ADDRESSES_PENDING })
    fetch(`${process.env.REACT_APP_API_URL}/properties`)
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


