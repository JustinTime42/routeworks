import React from "react"
import { Button } from "react-bootstrap"
import { migrateBasic, migrateCustomers, migrateLogs, migrateRouteData, migrateTags } from "./migrate"

const MigrationUI = () => {
    return (
        <div>
            <Button onClick={migrateCustomers}>Customers</Button>
            <Button onClick={() => migrateBasic('api/drivers', 'driver/driver_lists/driver')}>Drivers</Button>
            <Button onClick={() => migrateBasic('api/vehicles', 'driver/driver_lists/vehicle')}>Vehicles</Button>
            <Button onClick={() => migrateBasic('api/vehicletypes', 'driver/driver_lists/vehicle_type')}>Vehicle Types</Button>
            <Button onClick={() => migrateBasic('api/worktypes', 'driver/driver_lists/work_type')}>Work Types</Button>
            <Button onClick={migrateRouteData}>Route Data</Button>
            <Button onClick={migrateTags}>Tags</Button>
            <Button onClick={migrateLogs}>Logs</Button>
        </div>
    )
}