import React, { useState, useEffect } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux"
import {hideModal, showModal} from "../actions"
import CustomerContact from '../components/CustomerContact'
import RawCustomerData from '../components/RawCustomerData'

const AdminDropdown = () => {
    let location = useLocation()
    let navigate = useNavigate()
    const [showContactsMenu, setShowContactsMenu] = useState(false)
    const [showRawTableModal, setShowRawTableModal] = useState(false)
    const [lastLocation, setLastLocation] = useState(location)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const dispatch = useDispatch()
    
    useEffect(() => {
      setLastLocation(location)
    }, [location]);

    const onSelect = (event) => {
        switch(event) {
            //case "logs": return setShowLogsMenu({showLogsMenu: true})
            case "contact": return dispatch(showModal('Contact'))
            case "rawTable": return dispatch(showModal('All Customers'))
            default: return
        }
    }

    const onClose = () => {
        dispatch(hideModal('Contact'))
        dispatch(hideModal('All Customers'))
        dispatch(hideModal('User Editor'))        
        navigate(lastLocation)
    }

    return (
        <>                        
            <DropdownButton size="sm" title="Admin" onSelect={onSelect}>        
                <Dropdown.Item as={Link} to="/" key="route" eventKey="route">                              
                    Driver View
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/routebuilder" key="routebuilder" eventKey="routebuilder">                              
                    Editor View
                </Dropdown.Item>
                {
                currentUser.claims.role === 'Admin' ? 
                <>                
                <Dropdown.Item as={Link} to='/logs' key="logs" eventKey="logs">                                
                    Service Logs                          
                </Dropdown.Item>
                <Dropdown.Item key="contact" eventKey="contact">
                    Customer Contact 
                </Dropdown.Item>
                <Dropdown.Item key="rawTable" eventKey="rawTable">
                    All Customer Data
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/users" key="userEditor" eventKey="userEditor">
                    User Editor
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/migration" key="migration" eventKey="migration">
                    Data Migration
                </Dropdown.Item>
                </> : null}
            </DropdownButton>
            <CustomerContact show={showContactsMenu} onClose={onClose} />  
            <RawCustomerData show={showRawTableModal} onClose={onClose} />                               
        </>
    )    
}

export default AdminDropdown
