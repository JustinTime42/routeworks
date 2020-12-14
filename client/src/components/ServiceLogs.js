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
                { label: "Notes", key: "notes" },
                { label: "Driver", key: "user_name" },
                { label: "Tractor", key: "tractor" },
                { label: "Address", key: "address" },
                { label: "Price", key: "price"},
                { label: "Driver Earning", key: "driver_earning"}
                { label: "Property Value", key: "value"}
            ]
        } else {
            headers = [
                { label: "ContactName", key: "cust_name" },
                { label: "EmailAddress", key: "cust_email" },
                { label: "POAddressLine1", key: "address" },
                { label: "POCity", key: "city" },
                { label: "PORegion", key: "state" },
                { label: "POPostalCode", key: "zip" },
                { label: "InvoiceNumber", key: "invoice_number" },
                { label: "Reference", key: "reference" },
                { label: "InvoiceDate", key: "invoiceDate" },
                { label: "DueDate", key: "dueDate" },
                { label: "Description", key: "description" },
                { label: "Quantity", key: "quantity" },
                { label: "UnitAmount", key: "price" },
                { label: "AccountCode", key: "accountCode" },
                { label: "TaxType", key: "taxType" },
                { label: "Date", key: "date" },
                { label: "Time", key: "time" },
            ]  
        }
        return headers        
    }  

    const onDownload = () => {
        const startDateTz = startDate.toLocaleString("en-US", {timeZone: "America/Anchorage"})
        const endDateTz = endDate.toLocaleString("en-US", {timeZone: "America/Anchorage"})
        fetch(`${process.env.REACT_APP_API_URL}/getlogs?type=${logType}&start=${startDateTz}&end=${endDateTz}`)
        .then(response => response.json())
        .then(logs => {
            if (logType === 'xero') {
                logs.forEach(entry => {
                    entry.invoiceDate = invoiceDate
                    entry.dueDate = dueDate
                    entry.quantity = 1
                    entry.accountCode = 4000
                    entry.taxType = 'Tax Exempt (0%)'
                    entry.description += ` ${new Date(entry.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})}`
                    item.date = new Date(item.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})       
                    item.time = new Date(item.timestamp).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                })
            } else {
                logs.forEach((item => { 
                item.date = new Date(item.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})       
                item.time = new Date(item.timestamp).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                })) 
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
                <Button variant="secondary" onClick={props.onClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    )
    
}


export default ServiceLogs