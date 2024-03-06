import { addDoc, collection, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore"; 
import {db} from './firebase'
import { 
    FILTER_PROPERTIES_SUCCESS,
    SET_CURRENT_USER,
    TIMER_IS_RUNNING,
    SHOW_MODAL,
    HIDE_MODAL,
    TEMP_ITEM,
    SET_LOG_ENTRIES,
    USER_LOGOUT,
    IS_LOADING,
    COLOR_MODE,
    GET_ITEMS_PENDING,
    GET_ITEMS_FAILED,
    UPDATE_FAILED,
    UPDATE_PENDING,
    UPDATE_SUCCESS,
} from './constants.js'

export const setIsLoading = (isLoading) => {
    return {
        type: IS_LOADING,
        payload: isLoading
    }
}

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

export const createItem = (item, className, pendingAction = null, activeActionType = null, errorAction = null) => {
    return async(dispatch) => {
        dispatch({type: pendingAction})
        try {
            const result = await addDoc(collection(db, className), {...item})
            if (activeActionType) {
                dispatch({
                    type: activeActionType,
                    payload: {...item, id: result.id}
                })
            }
        }
        catch (error) {
            dispatch({ type: errorAction, payload: error })
            throw error
        }             
    }
}

// export const editItem = (item, itemList, className, activeActionType = null, listAction = null, merge = true) => (dispatch) => {
//     //dispatch({type: activeActionType, payload: item.nonAdminFields ? item.nonAdminFields : item})    
//     // if (item.adminFields) {
//     //     let tempList = [...itemList]
//     //     tempList[tempList.findIndex(i => i.admin_key === item.id)] = item.nonAdminFields
//     //     dispatch({type: listAction, payload: tempList})
//     // }    
//     console.log({...item})
//     const {id, ...itemDetails} = item
//     console.log({...itemDetails})
//     const itemRef = doc(db, className, id)    
//     const sendToDB = () => {           
//         updateDoc(itemRef, itemDetails)
//         .then((result) => {
//             console.log("success", result)
//             // dispatch({
//             //     type: activeActionType,
//             //     payload: {...item}
//             // })
//         })
//         .catch((e => alert(e)))
//     }
//     sendToDB()
// }

export const editItem = (item, itemList, className, pendingAction = null, listAction = null, errorAction=null) =>{
    return async(dispatch) => {
        dispatch({type: pendingAction})
        try {
            const {id, ...itemDetails} = item
            const itemRef = doc(db, className, id)         
            const test = await updateDoc(itemRef, itemDetails)
            console.log(test)
            // dispatch({
            //     type: listAction,
            //     payload: [...itemList, item]
            // })
            // if (activeActionType) {
            //     dispatch({
            //         type: activeActionType,
            //         payload: id
            //     })
            // }   
        } catch (error) {
            dispatch({ type: errorAction, payload: error })
        }
    }
}

export const deleteItem = (item, itemList, className, activeActionType = null, listAction = null) => (dispatch) => {
    dispatch({type: activeActionType, payload: null}) 
    let tempList = [...itemList]   
    if (item.adminFields) {        
        tempList.splice(tempList.findIndex(i => i.admin_key === item.id), 1)
        dispatch({type: listAction, payload: tempList}) 
    }     
    tempList.splice(tempList.findIndex(i => i.id === item.id), 1)
    if (listAction) {
        dispatch({type: listAction, payload: tempList})
    }    
    deleteDoc(doc(db, className, item.id))
    .then(() => {
        if (activeActionType) {
            dispatch({type: activeActionType, payload: {}})
        }
    })
    .catch(err => console.log(err))
}

export const setActiveItem = (item, itemArray = null, actionType) => {
    console.log("Setting Active Item: ", item)
    const activeItem = itemArray.find(i => i.id === item)
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

export const clearState = (state, action) => {
    return {
        type: USER_LOGOUT,
        payload: null
    }
}

export const setColorMode = (mode) => {
    return {
        type: COLOR_MODE,
        payload: mode
    }
}