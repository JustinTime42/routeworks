import React from "react"
import { useSelector } from "react-redux"
import { Button } from "react-bootstrap"
import { migrateBasic, migrateCustomers, migrateLogs, migrateRouteData, migrateTags, fixSandContract, copyNoRoutesAssigned } from "./migrate"

const MigrationUI = () => {
    const customers = useSelector(state => state.requestAllAddresses.addresses)
    const routes = useSelector(state => state.requestRoutes.routes)
    return (
        <div>
            <Button style={{margin: '1em'}} onClick={migrateCustomers}>Customers</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('/drivers', 'driver/driver_lists/driver')}>Drivers</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('/vehicles', 'driver/driver_lists/vehicle')}>Vehicles</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('/vehicletypes', 'driver/driver_lists/vehicle_type')}>Vehicle Types</Button>
            <Button style={{margin: '1em'}} onClick={() => migrateBasic('/worktypes', 'driver/driver_lists/work_type')}>Work Types</Button>
            <Button style={{margin: '1em'}} onClick={migrateRouteData}>Route Data</Button>
            <Button style={{margin: '1em'}} onClick={migrateTags}>Tags</Button>
            <Button style={{margin: '1em'}} onClick={migrateLogs}>Logs</Button>
            <Button style={{margin: '1em'}} onClick={() => fixSandContract(customers)}>Fix Sand Contract</Button>
            <Button style={{margin: '1em'}} onClick={() => copyNoRoutesAssigned(customers, routes)}>Copy Customers without routes</Button>

        </div>
    )
}

export default MigrationUI