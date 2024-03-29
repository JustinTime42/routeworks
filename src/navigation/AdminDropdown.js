import React, { useState, useEffect, lazy, Suspense } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux"
import {hideModal, showModal} from "../actions"
import CustomerContact from '../components/CustomerContact'
import RawCustomerData from '../components/RawCustomerData'
import DataImport from '../components/global_admin/DataImport'
import PricingTemplates from '../pricing_templates/PricingTemplates'

const AdminDropdown = () => {
    let location = useLocation()
    let navigate = useNavigate()
    const [lastLocation, setLastLocation] = useState(location)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const customers = useSelector(state => state.requestAllAddresses.addresses)
    const modals = useSelector(state => state.whichModals.modals)
    const dispatch = useDispatch()
    const { routeId } = useParams()
    
    useEffect(() => {
      setLastLocation(location)
    }, [location]);

    const onSelect = (event) => {
        switch(event) {
            case "contact": return dispatch(showModal('Contact'))
            case "rawTable": return dispatch(showModal('All Customers'))
            case "import": return dispatch(showModal('import'))
            default: return
        }
    }

    const onClose = (whichModal) => {
        dispatch(hideModal(whichModal))       
        navigate(lastLocation)
    }

    return (
        <>                        
            <DropdownButton size="sm" title="Admin" onSelect={onSelect}>        
                <Dropdown.Item as={Link} to={`/displayRoute/${routeId}`} key="route" eventKey="route">                              
                    Driver View
                </Dropdown.Item>
                <Dropdown.Item as={Link} to={`/routebuilder/${routeId}`} key="routebuilder" eventKey="routebuilder">                              
                    Editor View
                </Dropdown.Item>
                {
                currentUser.claims.role === 'Admin' ? 
                <>                
                <Dropdown.Item as={Link} to='/admin/logs' key="logs" eventKey="logs">                                
                    Service Logs                          
                </Dropdown.Item>
                <Dropdown.Item key="admin/contact" eventKey="contact">
                    Customer Contact 
                </Dropdown.Item>
                <Dropdown.Item key="rawTable" eventKey="rawTable">
                    All Customer Data
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/users" key="userEditor" eventKey="userEditor">
                    User Editor
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/auditor">
                    Audit Logs
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/pricing_templates">
                    Pricing Templates
                </Dropdown.Item>
                <Dropdown.Item key="import" eventKey="import">
                    Import Data
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/customers">
                    Customer Editor
                </Dropdown.Item>

                {/* <Dropdown.Item as={Link} to="/admin/fleet_tracker">
                    Fleet Tracker
                </Dropdown.Item> */}
                {currentUser.claims.email === 'justincase18@msn.com' && 
                    <Dropdown.Item as={Link} to="/admin/migration" key="migration" eventKey="migration">
                        Data Migration
                    </Dropdown.Item>}
                </> : null}
            </DropdownButton>
            <CustomerContact show={modals.includes('Contact')} onClose={onClose} />  
            <RawCustomerData 
                show={modals.includes('All Customers')} 
                onClose={onClose} 
                customers={customers}
            />
            <DataImport 
                show={modals.includes('import')} 
                onClose={() => onClose('import')} 
                org={currentUser.claims.organization}
            />
        </>
    )    
}

export default AdminDropdown
