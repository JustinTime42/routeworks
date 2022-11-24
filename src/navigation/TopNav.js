import React, { useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
import SimpleSelector from "../components/SimpleSelector"
import ShiftSetup from './ShiftSetup'
import RouteEditor from '../components/editor_panels/RouteEditor'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import AdminDropdown from "./AdminDropdown"
import Spinner from "../components/Spinner"
import {  setTempItem, showModal, setActiveItem} from "../actions"
import SearchBar from "./SearchBar"
import {REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE, UPDATE_ADDRESSES_FAILED, UPDATE_ADDRESSES_SUCCESS} from '../constants.js'
import '../styles/driver.css'

const TopNav = () => {
    const isAllPending = useSelector(state => state.requestAllAddresses.isPending)
    const routesPending = useSelector(state => state.requestRoutes.isPending)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const routes = useSelector(state => state.requestRoutes.routes)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)

    const dispatch = useDispatch()

    useEffect(() => {
        const unsub = onSnapshot(collection(db, `organizations/${organization}/customer`), (querySnapshot) => {
            dispatch({type: UPDATE_ADDRESSES_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
        })
        return () => {
            unsub()
        }
    },[])

    const onCreate = (whichModal) => {
        dispatch(setTempItem({name: '', active: true, editableBy: ['Supervisor', 'Admin'], customers: []}))
        dispatch(showModal(whichModal))
    }

    const onEdit = (item, whichModal) => {
        dispatch(setTempItem(item))
        dispatch(showModal(whichModal))
    }
    
    const onSelect = (event, itemArray, setActiveAction) => {
        document.getElementById('droppable2scroll')?.scrollTo(0,0)
        dispatch(setActiveItem(event, itemArray, setActiveAction))
    }

    return (
        <div style={{margin: "1em"}}>
            {
            (isAllPending || routesPending) ? <Spinner /> : null
            } 
            <div style={{display: "flex", flexWrap: "no-wrap", justifyContent: "space-around", margin: "5px", alignItems:'center',}}>
                <SimpleSelector
                    title="Route"
                    collection='route'
                    collectionPath={`organizations/${organization}/`} 
                    reduxListAction= {REQUEST_ROUTES_SUCCESS}
                    selectedItem={activeRoute}
                    itemArray={routes}
                    setActiveAction={SET_ACTIVE_ROUTE}
                    whichModal="Route"
                    onCreate={onCreate}
                    onEdit={onEdit}
                    onSelect={onSelect}
                    permissions={['Supervisor', 'Admin']}
                />
                <RouteEditor />
                <ShiftSetup />                
                <SearchBar />
                {['Supervisor','Admin'].includes(currentUser.claims.role) ? <AdminDropdown /> : null }
            </div>
        </div>            
    )
}

export default TopNav