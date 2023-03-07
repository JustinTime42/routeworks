import { editItem } from "../../actions"
import { DateTimeEditor, DateTimeRenderer, DeleteLogRenderer } from "./DateTimePicker"

const xeroHeaders =  [
    { headerName: "Contract Type", field: "contract_type"},
    { headerName: "ContactName", field: "cust_name"},
    { headerName: "Timestamp", field: "timestamp"},
    { headerName: 'Date', field: 'date'},
    { headerName: "Time", field: "time" },
    { headerName: "Notes", field: "notes" },
    { headerName: "Description", field: "description"},
    { headerName: "InvoiceNumber", field: "invoice_number"},
    { headerName: "Reference", field: "reference" },
    { headerName: "InvoiceDate", field: "invoiceDate"},
    { headerName: "DueDate", field: "dueDate"}, 
    { headerName: "UnitAmount", field: "price", valueParser: params => Number(params.newValue)},
    { headerName: "Work Type", field: "work_type"},
    { headerName: "Service Address", field: "service_address"},
    { headerName: "Status", field: "status"},
    { headerName: "Driver Name", field: "driver"},
    { headerName: "Vehicle", field: "vehicle"},
    { headerName: "Vehicle Type", field: "vehicle_type"},
    { headerName: "Driver Earning", field: "driverEarning", valueParser: params => Number(params.newValue)},
    { headerName: "Property Value", field: "value", valueParser: params => Number(params.newValue)},
    { headerName: "Start Time", field: "startTime"},
    { headerName: "End Time", field: "endTime"},
    { headerName: "Yardage Rate", field: "price_per_yard", valueParser: params => Number(params.newValue)},
    { headerName: "Yards", field: "yards", valueParser: params => Number(params.newValue)},
    { headerName: "Elapsed Precise", field: "elapsed"},
    { headerName: "Elapsed Rounded", field: "elapsed_rounded"},
    { headerName: "Hourly Rate", field: "hourly_rate", valueParser: params => Number(params.newValue)},
    { headerName: "Quantity", field: "quantity", valueParser: params => Number(params.newValue) },
    { headerName: "AccountCode", field: "accountCode"},
    { headerName: "TaxType", field: "taxType"},
    { headerName: "Email Address", field: "cust_email" },
    { headerName: "Second Email", field: "cust_email2" },
    { headerName: "Include Email2?", field: "include_email2" },
    { headerName: "POAddressLine1", field: "bill_address" },
    { headerName: "POCity", field: "bill_city" },
    { headerName: "PORegion", field: "bill_state" },
    { headerName: "POPostalCode", field: "bill_zip" },
]

const hourlyHeaders = [
    { headerName: "ContactName", field: "cust_name"},
    { headerName: "Date", field: "date" },
    { headerName: "Time", field: "time" },
    { headerName: "Notes", field: "notes" },
    { headerName: "Work Type", field: "work_type"},
    { headerName: "Driver Name", field: "driver"},
    { headerName: "Vehicle", field: "vehicle"},
    { headerName: "Vehicle Type", field: "vehicle_type"},
    { headerName: "Description", field: "description"},
    { headerName: "UnitAmount", field: "price", valueParser: params => Number(params.newValue) },
    { headerName: "Start Time", field: "startTime"},
    { headerName: "End Time", field: "endTime"},
    { headerName: "Elapsed Precise", field: "elapsed"},
    { headerName: "Elapsed Rounded", field: "elapsed_rounded"},
    { headerName: "EmailAddress", field: "cust_email" },
    { headerName: "Hourly Rate", field: "hourly_rate", valueParser: params => Number(params.newValue)},
    { headerName: "Yardage Rate", field: "price_per_yard", valueParser: params => Number(params.newValue)},
    { headerName: "Yards", field: "yards", valueParser: params => Number(params.newValue)},
]

const rawHeaders = [
    {headerName: 'Delete', cellRenderer:DeleteLogRenderer},
    { headerName: "Service Address", field: "service_address"},
    { headerName: "Contract Type", field: "contract_type"},
    { headerName: "Customer Name", field: "cust_name"},
    { headerName: "EmailAddress", field: "cust_email" },
    { headerName: "Second Email", field: "cust_email2" },
    { headerName: "Include Email2?", field: "include_email2" },
    { headerName: "Description", field: "description"},
    { headerName: "Driver Name", field: "driver"},
    { headerName: "Driver Earning", field: "driverEarning", valueParser: params => Number(params.newValue)},
    { headerName: "InvoiceNumber", field: "invoice_number", editable: false },
    { headerName: "Notes", field: "notes", editable: true },
    { headerName: "Price", field: "price", valueParser: params => Number(params.newValue) },
    { headerName: "Yards", field: "yards", valueParser: params => Number(params.newValue)},
    { headerName: "Yardage Rate", field: "price_per_yard", valueParser: params => Number(params.newValue)},
    { headerName: "Start Time", field: "startTime", cellRenderer:DateTimeRenderer, cellEditor: DateTimeEditor},
    { headerName: "End Time", field: "endTime", cellRenderer:DateTimeRenderer, cellEditor: DateTimeEditor},
    { headerName: "Hourly Rate", field: "hourly_rate"},
    { headerName: "Reference", field: "reference" },
    { headerName: "Status", field: "status"},
    { headerName: "Timestamp", field: "timestamp", cellRenderer:DateTimeRenderer, cellEditor: DateTimeEditor},
    { headerName: "Vehicle", field: "vehicle"},
    { headerName: "Vehicle Type", field: "vehicle_type"},
    { headerName: "Value", field: "value", valueParser: params => Number(params.newValue)},
    { headerName: "Work Type", field: "work_type"},
]

const customerHeaders = [
    { headerName: "Timestamp", field: "timestamp", cellRenderer:DateTimeRenderer, cellEditor: DateTimeEditor},
    { headerName: "Work Type", field: "work_type"},
    { headerName: "Description", field: "description"},
    { headerName: "Driver Name", field: "driver"},
    { headerName: "Vehicle", field: "vehicle"},
    { headerName: "Notes", field: "notes", editable: true },
    { headerName: "Yards", field: "yards", valueParser: params => Number(params.newValue)},
    { headerName: "Start Time", field: "startTime", cellRenderer:DateTimeRenderer, cellEditor: DateTimeEditor},
    { headerName: "End Time", field: "endTime", cellRenderer:DateTimeRenderer, cellEditor: DateTimeEditor},
    { headerName: "Status", field: "status"},
    { headerName: "Service Address", field: "service_address"},
    { headerName: "Contract Type", field: "contract_type"},
    { headerName: "Customer Name", field: "cust_name"},
    { headerName: "EmailAddress", field: "cust_email" },
    { headerName: "Second Email", field: "cust_email2" },
    { headerName: "Include Email2?", field: "include_email2" },
    { headerName: "Driver Earning", field: "driverEarning", valueParser: params => Number(params.newValue)},
    { headerName: "InvoiceNumber", field: "invoice_number", editable: false },
    { headerName: "Price", field: "price", valueParser: params => Number(params.newValue) },
    { headerName: "Yardage Rate", field: "price_per_yard", valueParser: params => Number(params.newValue)},
    { headerName: "Hourly Rate", field: "hourly_rate"},
    { headerName: "Reference", field: "reference" },
    { headerName: "Vehicle Type", field: "vehicle_type"},
    { headerName: "Value", field: "value", valueParser: params => Number(params.newValue)},
]

export const getColumnDefs = (logType, isEditting) => {
    console.log('isEditting', isEditting)
    if (logType === 'xero') return xeroHeaders
    else if (logType === 'hourly') return hourlyHeaders
    else if (logType === 'customer') {
        if (isEditting) return rawHeaders
        else return customerHeaders
    } 
    else {
        if (isEditting) return rawHeaders
        else {
            return rawHeaders.filter(i => i.headerName !== 'Delete')
        }  
    }

}