import React from "react"
import { useSelector } from "react-redux"
import { Button } from "react-bootstrap"
import { migrateBasic, migrateCustomers, migrateLogs, migrateRouteData, migrateTags, fixSandContract, copyNoRoutesAssigned } from "./migrate"

const MigrationUI = () => {
    const customers = useSelector(state => state.requestAllAddresses.addresses)
    const routes = useSelector(state => state.requestRoutes.routes)
    return (
        <div>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('driver/driver_lists/customer', 'organizations/Snowline/customer')}>Customers</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('driver/driver_lists/driver', 'organizations/Snowline/driver')}>Drivers</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('driver/driver_lists/route', 'organizations/Snowline/route')}>Route</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('driver/driver_lists/vehicle', 'organizations/Snowline/vehicle')}>Vehicle</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('driver/driver_lists/vehicle_type', 'organizations/Snowline/vehicle_type')}>Vehicle Type</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('driver/driver_lists/work_type', 'organizations/Snowline/work_type')}>Work Type</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('audit_logs', 'organizations/Snowline/audit_logs')}>Audit Logs</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('service_logs', 'organizations/Snowline/service_logs')}>Service Logs</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('driver/tags', 'organizations/Snowline/tags/tags')}>Tags</Button>


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