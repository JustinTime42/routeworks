import React, { useState } from 'react'
import { Button, Dropdown, DropdownButton, Modal, Form, Row, Col } from 'react-bootstrap'
import { CSVLink } from "react-csv";

const ServiceLogs = (props) => {
    const [showDownloadLink, setShowDownloadLink ] = useState(false)
    const [startDate, setStartDate ] = useState('')
    const [endDate, setEndDate ] = useState('')
    const [logs, setLogs ] = useState([])
    const [logType, setLogType ] = useState('')
    const [invoiceDate, setInvoiceDate ] = useState('')
    const [dueDate, setDueDate ] = useState('')

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
        } else if (logType === "hourly") {
            headers = [
                { label: "Customer Name", key: "cust_name" },
                { label: "Date", key: "date" },
                { label: "Time", key: "time" },
                { label: "Notes", key: "notes" },
                { label: "Work Type", key: "work_type"},
                { label: "Driver", key: "user_name" },
                { label: "Tractor", key: "tractor" },
                { label: "Description", key: "description" },
                { label: "UnitAmount", key: "price" }, //if hourly, this was (rounded quarter x hourly billing rate) else (yards x yardage rate)
                { label: "Start Time", key: "start_time"},
                { label: "End Time", key: "end_time"},
                { label: "Elapsed Time", key: "elapsed_time"}, // (stop time - start time) rounded down to nearest minute, then up to nearest 15 mins
                { label: "Hourly Rate", key: "hourly_rate"},
                { label: "Rate Per Yard", key: "price_per_yard"},
                { label: "Yards", key: "yards"},

            ]
            // check to see if hourly rate is actually save din the service log... might need to be added cause it's only calculated at the end
            // these are all numbers that should be calculated at the time of service... not at the time the log is pulled

        } else {
            headers = [
                { label: "Contract Type", key: "contract_type"},
                { label: "Contact Name", key: "cust_name" },
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
                { label: "Driver Name", key: "user_name"},
                { label: "Tractor", key: "tractor"},
                { label: "Driver Earning", key: "driver_earning"},
                { label: "Property Value", key: "value"},
                { label: "Start Time", key: "start_time"},
                { label: "End Time", key: "end_time"},
                { label: "Email Address", key: "cust_email" },
                { label: "Quantity", key: "quantity" },
                { label: "AccountCode", key: "accountCode" },
                { label: "TaxType", key: "taxType" },
                { label: "POAddressLine1", key: "bill_address" },
                { label: "POCity", key: "bill_city" },
                { label: "PORegion", key: "bill_state" },
                { label: "POPostalCode", key: "bill_zip" },
            ]  
        }
        return headers        
    }  
    const onClose = () => {
        setShowDownloadLink(false)
        props.onClose()
    }

    const onDownload = () => {
        setShowDownloadLink(false)
        const offset = new Date().getTimezoneOffset() * 60000
        const start = new Date(new Date(startDate).getTime() + offset).toISOString()
        let end = new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1) + offset).toISOString()
        fetch(`${process.env.REACT_APP_API_URL}/getlogs?type=${logType}&start=${start}&end=${end}`)
        .then(response => response.json())
        .then(logs => {
            console.log(logs)
            if (logType === 'xero') {
                logs.forEach(entry => {
                    entry.invoiceDate = invoiceDate
                    entry.dueDate = dueDate
                    entry.quantity = 1
                    entry.accountCode = 4000
                    entry.taxType = 'Tax Exempt (0%)'
                    entry.description += ` ${new Date(entry.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})}`
                    entry.date = new Date(entry.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})       
                    entry.time = new Date(entry.timestamp).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                })
            } else {
                logs.forEach((item => { 
                item.date = new Date(item.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})       
                item.time = new Date(item.timestamp).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                })) 
            }
            if (logType === 'hourly') {

            }
            setLogs(logs)
            setShowDownloadLink(true)
        })
        .catch(error => console.log(error))
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