import React, { useState } from 'react'
import { Button, Dropdown, DropdownButton, Modal, Form, Row, Col } from 'react-bootstrap'
import { collection, query, where, getDocs } from "firebase/firestore";
import { AgGridReact } from 'ag-grid-react';
import { db } from '../firebase'
import { CSVLink } from "react-csv";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css';

const ServiceLogs = (props) => {
    const [showDownloadLink, setShowDownloadLink ] = useState(false)
    const [startDate, setStartDate ] = useState('')
    const [endDate, setEndDate ] = useState('')
    const [logs, setLogs ] = useState([])
    const [logType, setLogType ] = useState('')
    const [invoiceDate, setInvoiceDate ] = useState('')
    const [dueDate, setDueDate ] = useState('')
    const [columnnDefs, setColumnDefs] = useState([])

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
        { headerName: "End Time", field: "end_time"},
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
        { headerName: "Start Time", field: "start_time"},
        { headerName: "End Time", field: "end_time"},
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
    const headers = () => {
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
                { label: "Start Time", key: "start_time"},
                { label: "End Time", key: "end_time"},
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
                { label: "Start Time", key: "start_time"},
                { label: "End Time", key: "end_time"},
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
                { label: "Start Time", key: "start_time"},
                { label: "End Time", key: "end_time"},
                { label: "Elapsed Precise", key: "elapsed"},
                { label: "Elapsed Rounded", key: "elapsed_rounded"},
                { label: "Hourly Rate", key: "hourly_rate"},
                { label: "Yardage Rate", key: "price_per_yard"},
                { label: "Yards", key: "yards"},
            ]
        }
        return headers        
    }  


    
    const onClose = () => {
        setShowDownloadLink(false)
        props.onClose()
    }

    const onDownload = async() => {
        setShowDownloadLink(false)
        const offset = new Date().getTimezoneOffset() * 60000
        const start = new Date(new Date(startDate).getTime() + offset).toISOString()
        let end = new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1) + offset).toISOString()

        console.log(start)
        const q = query(collection(db, 'service_logs'))
        const querySnapshot = await getDocs(q);
        let logs = []
        if (logType === 'xero') {
            querySnapshot.forEach((doc) => {
                let entry = {...doc.data(), id: doc.id}
                console.log(entry)
                entry.invoiceDate = invoiceDate
                entry.dueDate = dueDate
                entry.quantity = 1
                entry.accountCode = 4000
                entry.taxType = 'Tax Exempt (0%)'
                entry.description += ` ${new Date(entry.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})}`
                entry.date = new Date(entry.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})       
                entry.time = new Date(entry.timestamp).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                entry.startTime = (entry.startTime === null) ? null : new Date(entry.startTime).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                entry.endTime = (entry.endTime === null) ? null : new Date(entry.endTime).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                logs.push(entry)
            })
        } else if (logType === 'hourly') {
            querySnapshot.forEach((doc) => {
                let entry = {...doc.data(), id: doc.id}
                entry.elapsed = (new Date(entry.end_time) - new Date(entry.start_time)) / 3600000 // elapsed time as decimal hours
                entry.elapsed_rounded = Math.ceil(Math.floor(entry.elapsed * 60 ) / 15) / 4 // elapsed time as decimal hours rounded up to nearest 15 minutes                
                console.log(`${entry.cust_name}: Elapsed time: ${entry.elapsed}. Rounded up to 15 minutes: ${entry.elapsed_rounded}`)
                entry.description += ` ${new Date(entry.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})}`
                entry.date = new Date(entry.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})       
                entry.time = new Date(entry.timestamp).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                entry.start_time = (entry.start_time === null) ? null : new Date(entry.start_time).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                entry.end_time = (entry.end_time === null) ? null : new Date(entry.end_time).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                logs.push(entry)
            })            
        } else if (logType === 'raw') {
            querySnapshot.forEach(doc => {
                logs.push({...doc.data(), id: doc.id})
            })
        }

        console.log(logs)
        setLogs(logs.sort((a,b) => a.timestamp - b.timestamp))
        setShowDownloadLink(true)
    } 

    return (
        <Modal show={props.show} onHide={props.onClose}>
            <Modal.Header>Download Service Logs</Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>                                    
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control name="startDate" type="date" onChange={event => setStartDate(event.target.value)}/> 
                        <Form.Label>End Date</Form.Label>
                        <Form.Control name="endDate" type="date" onChange={event => setEndDate(event.target.value)}/>                                               
                        <Row>
                            <Col>
                                <DropdownButton title={logType || "Type"} onSelect={event => setLogType(event)}>        
                                    <Dropdown.Item key="xero" eventKey="xero">                                
                                            Xero                             
                                    </Dropdown.Item>
                                    <Dropdown.Item key="hourly" eventKey="hourly">                                
                                            Hourly                        
                                    </Dropdown.Item> 
                                    <Dropdown.Item key="raw" eventKey="raw">                                
                                            Raw                          
                                    </Dropdown.Item> 
                                </DropdownButton> 
                            </Col>
                            <Col>
                                <Form.Label>Invoice Date</Form.Label>
                                <Form.Control name="invoiceDate" type="date" onChange={event => setInvoiceDate(event.target.value)}/> 
                                <Form.Label>Due Date</Form.Label>
                                <Form.Control name="dueDate" type="date" onChange={event => setDueDate(event.target.value)}/>  
                            </Col>
                        </Row>  
                    </Form.Group>
                    {
                        showDownloadLink ?
                        <CSVLink data={logs} headers={headers()} filename={`servicelogs_${startDate}-${endDate}_${logType}.csv`}>
                        Download
                        </CSVLink> : <></>
                    } 
                </Form>                              
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onDownload}>Create File</Button>
                <Button variant="secondary" onClick={onClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    )    
}

export default ServiceLogs