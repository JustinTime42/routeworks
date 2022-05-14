import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { setActiveItem, createItem, deleteItem, editItem } from "../actions"

// not yet in use

const WithAPIFunctions = WrappedComponent => {
    const [showEdit, setShowEdit] = useState(false)
    const [deleteAlert, setDeleteAlert] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [dropDetails, setDropDetails] = useState(itemArray.find(item => item.key === activeItem))
    const [itemDetails, setItemDetails] = useState(selectedParentFields?.parentArray.find(item => item.key === selectedParentFields.parent))
    const dispatch = useDispatch()    

    const onSave = () => {
        if (itemDetails.key === 0) {            
            const {key, ...item} = itemDetails 
            dispatch(createItem(item, itemArray, table, updateListAction, setActiveAction))
        }
        else {
            dispatch(editItem(itemDetails, itemArray, table, updateListAction, setActiveAction))
        } 
        setShowModal(false)
    }
    
    const onDelete = (item) => {
        console.log("selected item", item)
        dispatch(deleteItem(item, itemArray, table, updateListAction))
        dispatch(setActiveItem(null, props.itemArray, props.setActiveAction))
       // setDeleteAlert('') // if this runs, it locks up the whole view after deleting item. investigate
        closeModal()        
    }

    const NewComponent = (props) => {
        return (
            <WrappedComponent {...props}/>
        )
    }

}

export default WithAPIFunctions(WrappedComponent)

// put functions and redux and stuff here, then wrap tractor and other presentation components with this. 
// then we can pass those presentation editors from Driver.js without props which we wouldn't have
// might need to wrap selector as well in an HOC to get the rest of the functionality
