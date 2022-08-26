import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { Button, Dropdown, DropdownButton, Modal, Form, Row, Col } from 'react-bootstrap'
import { collection, query, where, getDocs, onSnapshot, doc } from "firebase/firestore";
import { AgGridReact } from 'ag-grid-react';
import { db } from '../../firebase'
import { CSVLink } from "react-csv";
import { getColumnDefs, getCSVHeaders } from './headers';
import LogsTable from './LogsTable';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css';
import { setLogs } from '../../actions';

const ServiceLogs = (props) => {
    const [showDownloadLink, setShowDownloadLink ] = useState(false)
    const [startDate, setStartDate ] = useState('')
    const [endDate, setEndDate ] = useState('')
    const [logType, setLogType ] = useState('')
    const [invoiceDate, setInvoiceDate ] = useState('')
    const [dueDate, setDueDate ] = useState('')
    const [columnnDefs, setColumnDefs] = useState([])
    const logs = useSelector(state => state.setLogs.entries)

    const dispatch = useDispatch()

    useEffect(() => {
        console.log(startDate)
    }, [startDate])
    const onDownload = async() => {
        setShowDownloadLink(false)
        const offset = new Date().getTimezoneOffset() * 60000
        const start = Date.parse(startDate) + offset
        let end = Date.parse(endDate) + offset + 86400000// new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1) + offset).toISOString()
        
        const q = query(collection(db, 'service_logs'), where('timestamp', '>', start), where('timestamp', '<=', end))
        const querySnapshot = await getDocs(q);
        let logs = []
        if (logType === 'xero') {
            querySnapshot.forEach((doc) => {
                let entry = {...doc.data(), id: doc.id}
                entry.invoiceDate = invoiceDate
                entry.dueDate = dueDate
                entry.quantity = 1
                entry.accountCode = 4000
                entry.taxType = 'Tax Exempt (0%)'
                entry.description += ` ${new Date(entry.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})}`
                entry.date = new Date(entry.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})       
                entry.time = new Date(entry.timestamp).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                entry.startTime = (entry.startTime === null) ? null : entry.startTime.toDate().toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                entry.endTime = (entry.endTime === null) ? null : entry.endTime.toDate().toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
              // console.log(entry.startTime.toDate()) 
               logs.push(entry)
            })
        } else if (logType === 'hourly') {
            querySnapshot.forEach((doc) => {                
                let entry = {...doc.data(), id: doc.id}
                console.log(entry.startTime ? entry.startTime.seconds : 'nuthin')
                console.log(entry.endTime ? entry.endTime.seconds : 'nuthin')
                entry.elapsed = Math.round(((entry.endTime?.seconds) - (entry.startTime?.seconds)) / 36) / 100  // elapsed time as decimal hours
                entry.elapsed_rounded = Math.ceil(Math.floor(entry.elapsed * 60 ) / 15) / 4 // elapsed time as decimal hours rounded up to nearest 15 minutes                
                console.log(`${entry.cust_name}: Elapsed time: ${entry.elapsed}. Rounded up to 15 minutes: ${entry.elapsed_rounded}`)
                entry.description += ` ${new Date(entry.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})}`
                entry.date = new Date(entry.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})       
                entry.time = new Date(entry.timestamp).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                entry.startTime = (!entry.startTime) ? null : entry.startTime.toDate() //.toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                entry.endTime = (!entry.endTime || !entry.startTime) ? null : entry.endTime.toDate() //.toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                logs.push(entry)
                console.log(entry.elapsed)
                
            })            
        } else if (logType === 'raw') {
            querySnapshot.forEach(doc => {
                logs.push({...doc.data(), id: doc.id})
            })
        }
        console.log(logs)
        dispatch(setLogs(logs.sort((a,b) => a.timestamp - b.timestamp)))
        setShowDownloadLink(true)
    } 

    return (
        <>
        <Form style={{width:'80%', marginRight: 'auto', marginLeft: 'auto',}}>
            <Form.Group style={{display: "flex", flexWrap: "wrap", gap: '5px', justifyContent: "center", margin: "5px", alignItems:'end'}}>    
                <Form.Group>
                    <Form.Label >Start Date</Form.Label>
                    <Form.Control name="startDate" type="date" onChange={event => setStartDate(event.target.value)}/> 
                </Form.Group>                                
                <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control name="endDate" type="date" onChange={event => setEndDate(event.target.value)}/>
                </Form.Group>
                
                <Button variant="primary" onClick={onDownload}>Create File</Button>
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
                <Form.Group style={{visibility: logType === 'xero' ? 'visible' : 'hidden', display: "flex", flexWrap: "wrap", alignItems:'end'}}>
                    <Form.Group>
                            <Form.Label >Invoice Date</Form.Label>
                            <Form.Control name="invoiceDate" type="date" onChange={event => setInvoiceDate(event.target.value)}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label column={true}>Due Date</Form.Label>
                        <Form.Control name="dueDate" type="date" onChange={event => setDueDate(event.target.value)}/> 
                    </Form.Group> 
                </Form.Group>
            </Form.Group>
            {
                showDownloadLink ?
                <CSVLink data={logs} headers={getCSVHeaders(logType)} filename={`servicelogs_${startDate}-${endDate}_${logType}.csv`}>
                Download CSV File
                </CSVLink> : <></>
            } 
        </Form>   
        <LogsTable logType={logType} logs={logs} />
        </>
    )    
}

export default ServiceLogs