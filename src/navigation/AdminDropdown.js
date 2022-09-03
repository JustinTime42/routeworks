import React, { useState, useEffect } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux"
import {hideModal, showModal, showRouteEditor} from "../actions"
import ServiceLogs from "../components/service_logs/ServiceLogs"
import CustomerContact from '../components/CustomerContact'
import RawCustomerData from '../components/RawCustomerData'
import UserEditor from '../components/editor_panels/UserEditor'

const AdminDropdown = () => {
    let location = useLocation()
    let navigate = useNavigate()
    const [showLogsMenu, setShowLogsMenu] = useState(false)
    const [showContactsMenu, setShowContactsMenu] = useState(false)
    const [showRawTableModal, setShowRawTableModal] = useState(false)
    const [lastLocation, setLastLocation] = useState(location)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const modals = useSelector(state => state.whichModals.modals)
    const dispatch = useDispatch()
    

    useEffect(() => {
      setLastLocation(location)
    }, [location]);

    const onSelect = (event) => {
        switch(event) {
            //case "logs": return setShowLogsMenu({showLogsMenu: true})
            case "contact": return setShowContactsMenu({showContactsMenu: true})
            case "rawTable": return dispatch(showModal('All Customers'))
            case "userEditor": return dispatch(showModal('User Editor'))
            default: return
        }
    }

   // onClose = () => this.setState({showLogsMenu: false, showDownload: false, showContactsMenu: false, showRawTableModal: false, showUserEditor: false})
    const onClose = () => {
        setShowLogsMenu(false)
        setShowContactsMenu(false)
        setShowRawTableModal(false)
        navigate(lastLocation)
    }

// if(this.state.userRole === 'Admin') {
    return (
        <>                        
            <DropdownButton size="sm" title="Admin" onSelect={onSelect}>        
                <Dropdown.Item as={Link} to="/" key="route" eventKey="route">                              
                    Driver View
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/routebuilder" key="routebuilder" eventKey="routebuilder">                              
                    Editor View
                </Dropdown.Item>
                <Dropdown.Item as={Link} to={'/logs'} key="logs" eventKey="logs">                                
                    Service Logs                          
                </Dropdown.Item>
                {/* <Dropdown.Item key="contact" eventKey="contact">
                    Customer Contact 
                </Dropdown.Item> */}
                <Dropdown.Item key="rawTable" eventKey="rawTable">
                    All Customer Data
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/users" key="userEditor" eventKey="userEditor">
                    User Editor
                </Dropdown.Item>
            </DropdownButton>
            <CustomerContact show={showContactsMenu} onClose={onClose} />  
            <RawCustomerData show={showRawTableModal} onClose={onClose} />                               
        </>
    )
//  } else return null
    
}

export default AdminDropdown
