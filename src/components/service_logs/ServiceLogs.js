import React, { useState, lazy, Suspense } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { Button, Dropdown, DropdownButton, Form, } from 'react-bootstrap'
import { collection, query, where, getDocs, Timestamp} from "firebase/firestore";
import { db } from '../../firebase'
import LogsTable from './LogsTable';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css';
import { setLogs, hideModal, showModal } from '../../actions';
import FileUpload from '../migration/FileUpload';

const ServiceLogs = (props) => {
    const [startDate, setStartDate ] = useState('')
    const [endDate, setEndDate ] = useState('')
    const [logType, setLogType ] = useState('')
    const [invoiceDate, setInvoiceDate ] = useState('')
    const [dueDate, setDueDate ] = useState('')
    const [editable, setEditable] = useState(false)
    const logs = useSelector(state => state.setLogs.entries)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const modals = useSelector(state => state.whichModals.modals)
    const FileUpload = lazy(() => import('../migration/FileUpload'))

    const dispatch = useDispatch()

    const handleSelect = (event) => {
        setLogType(event)
        setEditable(false)
        dispatch(setLogs([]))
    }

    const onDownload = async() => {
        const offset = new Date().getTimezoneOffset() * 60000
        const start = Timestamp.fromDate(new Date(Date.parse(startDate) + offset))
        console.log(start)
        let end = Timestamp.fromDate(new Date(Date.parse(endDate) + offset + 86400000))// new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1) + offset).toISOString()
        
        const q = query(collection(db, `organizations/${organization}/service_logs`), where('timestamp', '>', start), where('timestamp', '<=', end))
        const querySnapshot = await getDocs(q)
        let logs = []
        if (logType === 'xero') {
            querySnapshot.forEach((doc) => {
                let entry = {...doc.data(), id: doc.id}
                entry.invoiceDate = invoiceDate
                entry.timestamp = entry.timestamp.toDate()
                entry.dueDate = dueDate
                entry.quantity = 1
                entry.accountCode = 4000
                entry.taxType = 'Tax Exempt (0%)'
                entry.description += ` ${new Date(entry.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})}`
                entry.date = new Date(entry.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})       
                entry.time = new Date(entry.timestamp).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                if (entry.contract_type === 'Hourly') {                    
                    entry.elapsed = Math.round(((entry.endTime?.seconds) - (entry.startTime?.seconds)) / 36) / 100 // elapsed time as decimal hours
                    entry.elapsed_rounded = Math.ceil(Math.floor(entry.elapsed * 60 ) / 15) / 4 // elapsed time as decimal hours rounded up to nearest 15 minutes 
                    entry.startTime = (!entry.startTime) ? null : entry.startTime.toDate() 
                    entry.endTime = (!entry.endTime) ? null : entry.endTime.toDate() 
                }

               logs.push(entry)
            })
        } else if (logType === 'hourly') {
            querySnapshot.forEach((doc) => {                
                let entry = {...doc.data(), id: doc.id}
                if (entry.contract_type === 'Hourly') {
                    entry.timestamp = entry.timestamp.toDate()    
                    entry.elapsed = Math.round(((entry.endTime?.seconds) - (entry.startTime?.seconds)) / 36) / 100 // elapsed time as decimal hours
                    entry.elapsed_rounded = Math.ceil(Math.floor(entry.elapsed * 60 ) / 15) / 4 // elapsed time as decimal hours rounded up to nearest 15 minutes           
                    
                    entry.description += ` ${new Date(entry.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})}`
                    entry.date = new Date(entry.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})       
                    entry.time = new Date(entry.timestamp).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                    entry.startTime = (!entry.startTime) ? null : entry.startTime.toDate() 
                    entry.endTime = (!entry.endTime || !entry.startTime) ? null : entry.endTime.toDate() 
                    logs.push(entry)
                }                
            })            
        } else if (logType === 'raw') {
            querySnapshot.forEach(doc => {
                let entry = {...doc.data(), id: doc.id}  
                logs.push({
                    ...entry,
                    timestamp: entry.timestamp.toDate(),
                    ...(!!entry.startTime) && {startTime: entry.startTime.toDate()},
                    ...(!!entry.endTime) && {endTime: entry.endTime.toDate()},
                })
            })
        }
        dispatch(setLogs(logs.sort((a,b) => b.timestamp - a.timestamp)))
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
                <DropdownButton title={logType || "Type"} onSelect={event => handleSelect(event)}>        
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
                <Button variant="primary" onClick={onDownload}>Create File</Button> 
                <Form.Group style={{visibility: logType === 'xero' ? 'visible' : 'hidden', display: "flex", flexWrap: "wrap", alignItems:'end'}}>
                    <Form.Group>
                            <Form.Label>Invoice Date</Form.Label>
                            <Form.Control name="invoiceDate" type="date" onChange={event => setInvoiceDate(event.target.value)}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label column={true}>Due Date</Form.Label>
                        <Form.Control name="dueDate" type="date" onChange={event => setDueDate(event.target.value)}/> 
                    </Form.Group> 
                </Form.Group>
                
                <Button style={{visibility: logs.length && (logType === 'raw') ? 'visible' : 'hidden'}} onClick={() => setEditable(!editable)}>
                    {!editable ? "Start Editing" : "Stop Editing"}
                </Button>
                <Button onClick={() => dispatch(showModal('File Upload'))}>Upload Service Logs CSV</Button>

            </Form.Group>
        </Form>   
        <LogsTable logType={logType} logs={logs} editable={editable}/>
        <Suspense fallback={<div>Loading...</div>}>
            <FileUpload 
                org={organization}
                show={modals.includes('File Upload')}
                onClose={() => dispatch(hideModal('File Upload'))}
                collection={'service_logs'}
            />  
        </Suspense>
  
        </>
    )    
}

export default ServiceLogs