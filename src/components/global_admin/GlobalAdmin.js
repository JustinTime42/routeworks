import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { Button } from "react-bootstrap"

import { createStripeCustomers, addLatLngToCustomers, migrateCustomerPricing, fixOrphanedRoutes, migrateBasic, migrateCustomers, migrateLogs, migrateRouteData, migrateTags, fixSandContract, copyNoRoutesAssigned, addEmailsToLogs, addContractTypeToRoutes, assignContractType, migrateDates, addIDToAuditLogs, routeArrayToMap, displayBadChanges, fixRoutesAssigned, attachStripeIDtoLogs, findCustomersMissingFromStripe } from "./migrate"
import { Link } from "react-router-dom"
import { hideModal, clearState } from "../../actions"
import { logout } from "../../firebase"


const MigrationUI = () => {
    const serviceLocations = useSelector(state => state.requestAllAddresses.addresses)
    const routes = useSelector(state => state.requestRoutes.routes)
    const customers = useSelector(state => state.getAllCustomers.customers)
    const dispatch = useDispatch()

    const handleNoEmailClick = () => {
        const noEmails = customers.filter(c => !c.cust_email)
        console.log(noEmails)
    }

    const handleLogout = () => {        
        // this doesn't work as expected because this component unmounts when the modal is hidden 
        // and doesn't execute the rest of the function, and can't navigate with the modal open
        // solution: look at Router and see how to handle this at the top level routes, like redirecting to login page if no auth
        dispatch(hideModal("Shift")) 
        dispatch(clearState())
        console.log("logging out")
        logout()      
    };

    return (
        <div>
            <Link to="/querybuilder">
                <Button style={{margin: '1em'}}>Query Builder</Button>
            </Link>
            <Link to="/users">
                <Button style={{margin: '1em'}}>Users</Button>
            </Link>
            <Button onClick={handleLogout}>Logout</Button>

            {/* <Button style={{margin: '1em'}} onClick={() => migrateBasic('driver/driver_lists/customer', 'organizations/Snowline/customer')}>Customers</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('driver/driver_lists/driver', 'organizations/Snowline/driver')}>Drivers</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('driver/driver_lists/route', 'organizations/Snowline/route')}>Route</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('driver/driver_lists/vehicle', 'organizations/Snowline/vehicle')}>Vehicle</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('driver/driver_lists/vehicle_type', 'organizations/Snowline/vehicle_type')}>Vehicle Type</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('driver/driver_lists/work_type', 'organizations/Snowline/work_type')}>Work Type</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('audit_logs', 'organizations/Snowline/audit_logs')}>Audit Logs</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('service_logs', 'organizations/Snowline/service_logs')}>Service Logs</Button>
            <Button style={{margin: '1em'}} onClick={migrateTags}>Tags</Button>
            <Button style={{margin: '1em'}} onClick={() => addEmailsToLogs(customers)}>Add Emails To Logs</Button>
            
            <Button style={{ margin: '1em' }} onClick={() => assignContractType(routes, customers)}>Add Contract Type To Routes</Button>
            <Button style={{margin: '1em'}} onClick={() => addIDToAuditLogs()}>Add IDS</Button> */}
            {/* <Button style={{margin: '1em'}} onClick={() => routeArrayToMap(routes)}>change route customers from array to maps</Button> */}

            {/* <Button style={{margin: '1em'}} onClick={addLatLngToCustomers}>Add Lat Longs</Button> */}
            {/* <Button style={{margin: '1em'}} onClick={() => fixRoutesAssigned(routes, serviceLocations)}>Fix Routes Assigned</Button>
            <Button style={{margin: '1em'}} onClick={() => createStripeCustomers(customers)}>Create Stripe Customers</Button> */}
            {/* <Button stype={{margin: '1em'}} onClick={() => attachStripeIDtoLogs(customers)}>Attach Stripe ID to Logs</Button>
            <Button style={{margin: '1em'}} onClick={handleNoEmailClick}>Show Customers without emails</Button>
            <Button style={{margin: '1em'}} onClick={() => findCustomersMissingFromStripe(customers)}>Find and fix customers with missing emails</Button> */}
            {/* <Button style={{margin: '1em'}} onClick={() => migrateCustomerPricing(customers)}>Migrate Customer Pricing</Button> */}
            {/* <Button style={{margin: '1em'}} onClick={() => migrateBasic('/vehicles', 'driver/driver_lists/vehicle')}>Vehicles</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('/vehicletypes', 'driver/driver_lists/vehicle_type')}>Vehicle Types</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('/worktypes', 'driver/driver_lists/work_type')}>Work Types</Button>
            <Button style={{margin: '1em'}} onClick={migrateTags}>Tags</Button>
            <Button style={{margin: '1em'}} onClick={migrateLogs}>Logs</Button>
            <Button style={{margin: '1em'}} onClick={() => fixSandContract(customers)}>Fix Sand Contract</Button>
            <Button style={{margin: '1em'}} onClick={() => copyNoRoutesAssigned(customers, routes)}>Copy Customers without routes</Button> */}

        </div>
    )
}

export default MigrationUI