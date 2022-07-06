/*
drag and drop
if source === dest & dest === route
    reorder route
else 
if dest === rightSide
    remove from route
else 
    add to route
    set status waiting


maintain two lists: 
    routeProperties
        all the properties currently on the route
        this updates live - sends to server during onDrop
    otherProperties
        all properties except the current route properties

For state management, we'll use local state synced with firestore subscription like the dropdowns
*/


import React, {useState, useEffect} from 'react'
import { useDispatch, useSelector } from "react-redux";
import * as styles from './route-builder-styles'
import * as dnd from './drag-functions'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { editItem, requestAllAddresses, filterRouteProperties, saveRoute, setActiveProperty, saveNewProperty, editProperty, deleteProperty, getRouteData, createItem, setTempItem } from "../../actions"


const RouteBuilder = () => {
    const modals = useSelector(state => state.whichModals.modals)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const activeCustomer = useSelector(state => state.setActiveProperty.activeProperty)
    //const allCustomers = useSelector(state => state.requestAllAddresses.addresses)
    const routeProperties = useSelector(state => state.getRouteProperties.addresses)
    const routeData = useSelector(state => state.getRouteData.routeData)
    const dispatch = useDispatch()

    const [onRouteList, setOnRouteList] = useState(routeProperties)
    const [offRouteList, setOffRouteList] = useState([])
    const [allCustomers, setAllCustomers] = useState([])
    const [scrollPosition, setScrollPosition] = useState(0)
    const [searchField, setSearchField] = useState('')
    

    useEffect(() => {
        const q = query(collection(db, `admin/admin_lists/customer`)) 
        const unsub = onSnapshot(q, (querySnapshot) => {
            const results = [];
            querySnapshot.forEach((doc) => {
                const id = doc.id
                results.push({...doc.data(), id});
            })
            setAllCustomers(results)
        })
        return () => {
            unsub()
        }        
    },[])

    useEffect(() => {
        const q = query(collection(db, `admin/admin_lists/customer`)) 
        const unsub = onSnapshot(q, (querySnapshot) => {
            const results = [];
            querySnapshot.forEach((doc) => {
                const id = doc.id
                results.push({...doc.data(), id});
            })
            setAllCustomers(results)
        })
        return () => {
            unsub()
        }        
    },[])
}