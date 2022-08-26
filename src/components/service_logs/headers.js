const xeroHeaders =  [
    { headerName: "Contract Type", field: "contract_type"},
    { headerName: "ContactName", field: "cust_name" },
    { headerName: "Date", field: "date" },
    { headerName: "Time", field: "time" },
    { headerName: "Notes", field: "notes" },
    { headerName: "Description", field: "description" },
    { headerName: "InvoiceNumber", field: "invoice_number" },
    { headerName: "Reference", field: "reference" },
    { headerName: "InvoiceDate", field: "invoiceDate" },
    { headerName: "DueDate", field: "dueDate" }, 
    { headerName: "UnitAmount", field: "price" },
    { headerName: "Work Type", field: "work_type"},
    { headerName: "Service Address", field: "address"},
    { headerName: "Status", field: "status"},
    { headerName: "Driver Name", field: "driver"},
    { headerName: "Vehicle", field: "tractor"},
    { headerName: "Vehicle Type", field: "vehicle_type"},
    { headerName: "Driver Earning", field: "driverEarning"},
    { headerName: "Property Value", field: "value"},
    { headerName: "Start Time", field: "start_time"},
    { headerName: "End Time", field: "endTime"},
    { headerName: "Yardage Rate", field: "price_per_yard"},
    { headerName: "Yards", field: "yards"},
    { headerName: "Elapsed Precise", field: "elapsed"},
    { headerName: "Elapsed Rounded", field: "elapsed_rounded"},
    { headerName: "Hourly Rate", field: "hourly_rate"},
    { headerName: "Quantity", field: "quantity" },
    { headerName: "AccountCode", field: "accountCode" },
    { headerName: "TaxType", field: "taxType" },
    { headerName: "EmailAddress", field: "cust_email" },
    { headerName: "POAddressLine1", field: "bill_address" },
    { headerName: "POCity", field: "bill_city" },
    { headerName: "PORegion", field: "bill_state" },
    { headerName: "POPostalCode", field: "bill_zip" },
]

const hourlyHeaders = [
    { headerName: "ContactName", field: "cust_name" },
    { headerName: "Date", field: "date" },
    { headerName: "Time", field: "time" },
    { headerName: "Notes", field: "notes" },
    { headerName: "Work Type", field: "work_type"},
    { headerName: "Driver Name", field: "driver"},
    { headerName: "Vehicle", field: "tractor"},
    { headerName: "Vehicle Type", field: "vehicle_type"},
    { headerName: "Description", field: "description" },
    { headerName: "UnitAmount", field: "price" },
    { headerName: "Start Time", field: "startTime"},
    { headerName: "End Time", field: "endTime"},
    { headerName: "Elapsed Precise", field: "elapsed"},
    { headerName: "Elapsed Rounded", field: "elapsed_rounded"},
    { headerName: "Hourly Rate", field: "hourly_rate"},
    { headerName: "Yardage Rate", field: "price_per_yard"},
    { headerName: "Yards", field: "yards"},
]

const rawHeaders = [
    { headerName: "Service Address", field: "address"},
    { headerName: "Contract Type", field: "contract_type"},
    { headerName: "Customer Name", field: "cust_name" },
    { headerName: "Description", field: "description" },
    { headerName: "Driver Name", field: "driver"},
    { headerName: "Driver Earning", field: "driverEarning"},
    { headerName: "InvoiceNumber", field: "invoice_number" },
    { headerName: "Notes", field: "notes" },
    { headerName: "Price", field: "price" },
    { headerName: "Yards", field: "yards"},
    { headerName: "Yardage Rate", field: "price_per_yard"},
    { headerName: "Elapsed Precise", field: "elapsed"},
    { headerName: "Elapsed Rounded", field: "elapsed_rounded"},
    { headerName: "Hourly Rate", field: "hourly_rate"},
    { label: "Reference", key: "reference" },
    { headerName: "Status", field: "status"},
    { label: "Timestamp", key: "timestamp" },
    { headerName: "Vehicle", field: "tractor"},
    { headerName: "Vehicle Type", field: "vehicle_type"},
    { headerName: "Value", field: "value"},
    { headerName: "Work Type", field: "work_type"},



]
export const getCSVHeaders = (logType) => {
    let headers = []
    if (logType === "raw"){
        headers = [
            { label: "Customer Name", key: "cust_name" },
            { label: "status", key: "status" },
            { label: "Date", key: "date" },
            { label: "Time", key: "time" },
            { label: "Description", key: "description" },
            { label: "Notes", key: "notes" },
            { label: "Driver", key: "user_name" },
            { label: "Tractor", key: "tractor" },
            { label: "Address", key: "address" },
            { label: "Price", key: "price"},
            { label: "Driver Earning", key: "driver_earning"},
            { label: "Property Value", key: "value"},
            { label: "Contract Type", key: "contract_type"},
            { label: "Work Type", key: "work_type"},
            { label: "Start Time", key: "startTime"},
            { label: "End Time", key: "endTime"},
        ]
    } else if (logType === 'xero') {
        headers = [
            { label: "Contract Type", key: "contract_type"},
            { label: "ContactName", key: "cust_name" },
            { label: "Date", key: "date" },
            { label: "Time", key: "time" },
            { label: "Notes", key: "notes" },
            { label: "Description", key: "description" },
            { label: "InvoiceNumber", key: "invoice_number" },
            { label: "Reference", key: "reference" },
            { label: "InvoiceDate", key: "invoiceDate" },
            { label: "DueDate", key: "dueDate" }, 
            { label: "UnitAmount", key: "price" },
            { label: "Work Type", key: "work_type"},
            { label: "Service Address", key: "address"},
            { label: "Status", key: "status"},
            { label: "Driver Name", key: "driver"},
            { label: "Vehicle", key: "tractor"},
            { label: "Vehicle Type", key: "vehicle_type"},
            { label: "Driver Earning", key: "driverEarning"},
            { label: "Property Value", key: "value"},
            { label: "Start Time", key: "startTime"},
            { label: "End Time", key: "endTime"},
            { label: "Yardage Rate", key: "price_per_yard"},
            { label: "Yards", key: "yards"},
            { label: "Elapsed Precise", key: "elapsed"},
            { label: "Elapsed Rounded", key: "elapsed_rounded"},
            { label: "Hourly Rate", key: "hourly_rate"},
            { label: "Quantity", key: "quantity" },
            { label: "AccountCode", key: "accountCode" },
            { label: "TaxType", key: "taxType" },
            { label: "EmailAddress", key: "cust_email" },
            { label: "POAddressLine1", key: "bill_address" },
            { label: "POCity", key: "bill_city" },
            { label: "PORegion", key: "bill_state" },
            { label: "POPostalCode", key: "bill_zip" },
        ]  
    } else if (logType === 'hourly') {
        headers = [
            { label: "ContactName", key: "cust_name" },
            { label: "Date", key: "date" },
            { label: "Time", key: "time" },
            { label: "Notes", key: "notes" },
            { label: "Work Type", key: "work_type"},
            { label: "Driver Name", key: "driver"},
            { label: "Vehicle", key: "tractor"},
            { label: "Vehicle Type", key: "vehicle_type"},
            { label: "Description", key: "description" },
            { label: "UnitAmount", key: "price" },
            { label: "Start Time", key: "startTime"},
            { label: "End Time", key: "endTime"},
            { label: "Elapsed Precise", key: "elapsed"},
            { label: "Elapsed Rounded", key: "elapsed_rounded"},
            { label: "Hourly Rate", key: "hourly_rate"},
            { label: "Yardage Rate", key: "price_per_yard"},
            { label: "Yards", key: "yards"},
        ]
    }
    return headers        
}  

export const getColumnDefs = (type) => {
    console.log(type)
    switch (type) {
        case 'xero': return xeroHeaders
        case 'hourly': return hourlyHeaders
        case 'raw': return rawHeaders
    }
}