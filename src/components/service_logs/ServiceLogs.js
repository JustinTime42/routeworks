import React, { useState, useEffect, lazy, Suspense } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { Button, Dropdown, DropdownButton, Form, Spinner, Tooltip } from 'react-bootstrap'
import { collection, query, where, getDocs, Timestamp, doc, onSnapshot} from "firebase/firestore";
import { httpsCallable, functions } from '../../firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '../../firebase'
import LogsTable from './LogsTable';
import { setLogs, hideModal, showModal, setIsLoading } from '../../actions';
import { toHRDateFormat, toHRTimeFormat } from '../utils';
import ButtonWithLoading from '../buttons/ButtonWithLoading';
import Invoices from './Invoices';

const ServiceLogs = (props) => {
    const [startDate, setStartDate ] = useState('')
    const [endDate, setEndDate ] = useState('')
    const [logType, setLogType ] = useState('')
    const [showInvoices, setShowInvoices] = useState(false)
    const [invoiceDate, setInvoiceDate ] = useState('')
    const [dueDate, setDueDate ] = useState('')
    const [isSendInvoicesLoading, setIsSendInvoicesLoading] = useState(false)
    const [showStripeOnboard, setShowStripeOnboard ] = useState(false)
    const [editable, setEditable] = useState(false)
    const logs = useSelector(state => state.setLogs.entries)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const isLoading = useSelector(state => state.setIsLoading.isLoading)
    const allCustomers = useSelector(state => state.requestAllAddresses.addresses)
    const [value, loading, error] = useDocumentData(
        doc(db, 'organizations/', organization),
        {
          snapshotListenOptions: { includeMetadataChanges: true },
        }
      )

    const dispatch = useDispatch()

    useEffect(() => {
        console.log(value)
        if (!loading && !error && !value.stripe_account_id) {
            setShowStripeOnboard(true)
        } else {
            setShowStripeOnboard(false)
        }
    }, [error, loading, value])

    const handleSetDueDate = (value) => {
        const offset = new Date().getTimezoneOffset() * 60000
        const date = new Date(Date.parse(value) + offset + 86400000)
        setDueDate(date)
    }

    useEffect(() => {
        if (!startDate || !endDate || !logType) {
            dispatch(setLogs([]))
            return
        }
        const offset = new Date().getTimezoneOffset() * 60000
        const start = Timestamp.fromDate(new Date(Date.parse(startDate) + offset))
        let end = Timestamp.fromDate(new Date(Date.parse(endDate) + offset + 86400000))
        const q = query(
            collection(db, `organizations/${organization}/service_logs`), 
            where('timestamp', '>', start), 
            where('timestamp', '<=', end))
        const unsub = onSnapshot(q, (querySnapshot) => {
            onDownload(querySnapshot)
        })
        return () => {
            unsub()
        }
    },[startDate, endDate, logType, organization])

    const handleSelect = (event) => {
        setLogType(event)
        setEditable(false)
        dispatch(setLogs([]))
    }

    const handleStripeOnboarding = () => {
        const createStripeConnectedAccount = httpsCallable(functions, 'createStripeConnectedAccount') 
        createStripeConnectedAccount({orgName: value.orgName}).then((res) => {
            console.log(res)
            dispatch(setIsLoading(false))
            window.open(res.data.url, '_blank') 
        })
        .catch(err => {
            alert(err)
            dispatch(setIsLoading(false))
        })
    }

    const sendInvoices = () => {
        setIsSendInvoicesLoading(true)
        const createAndSendInvoices = httpsCallable(functions, "getPendingBalances")
        const due = new Date(dueDate).getTime() / 1000
        console.log(value.stripe_account_id)
        createAndSendInvoices({customers: allCustomers, stripeAccount: value.stripe_account_id, dueDate: due})
        .then(res => {
            console.log(res)
            setIsSendInvoicesLoading(false)
        })
        .catch(err => {
            setIsSendInvoicesLoading(false)
            alert(err)
        })
    }

    const createStripeCustomers = async () => {
        const createStripeCustomers = httpsCallable(functions, "createStripeCustomers")
        createStripeCustomers({customers:allCustomers, stripeAccount: value.stripe_account_id})
    }

    const onDownload = (querySnapshot) => {
        let logs = []
        if (logType === 'xero') {
            querySnapshot.forEach((doc) => {
                let entry = {...doc.data(), id: doc.id}
                const timestamp = entry.timestamp.toDate()
                const dateHR = toHRDateFormat(timestamp)
                const timeHR = toHRTimeFormat(timestamp)
                entry.invoiceDate = invoiceDate
                entry.timestamp = timestamp
                entry.dueDate = dueDate
                entry.quantity = 1
                entry.accountCode = 4000
                entry.taxType = 'Tax Exempt (0%)'
                entry.description += dateHR
                entry.date = dateHR
                entry.time = timeHR
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
        } else if ((logType === 'raw') || (logType === 'stripe')) {
            querySnapshot.forEach(doc => {
                console.log(doc.data())
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
                <DropdownButton title={logType || "Format"} onSelect={event => handleSelect(event)}>        
                    <Dropdown.Item key="xero" eventKey="xero">                                
                        Xero                             
                    </Dropdown.Item>
                    <Dropdown.Item key="hourly" eventKey="hourly">                                
                        Hourly                        
                    </Dropdown.Item> 
                    <Dropdown.Item key="raw" eventKey="raw">                                
                        Full Data                          
                    </Dropdown.Item> 
                    <Dropdown.Item key="stripe" eventKey="stripe" style={{visibility: !showStripeOnboard ? "visible" : "hidden"}}>                                
                        Stripe Billing                          
                    </Dropdown.Item> 
                </DropdownButton>    
                <Button style={{visibility: logs.length && ((logType === 'raw') || (logType === 'stripe')) ? 'visible' : 'hidden'}} onClick={() => setEditable(!editable)}>
                    {!editable ? "Start Editing" : "Stop Editing"}
                </Button>          
                {/* <Button variant="primary" onClick={onDownload}>Create File</Button>  */}
                <ButtonWithLoading
                    handleClick={handleStripeOnboarding}
                    tooltip="Create your Stripe account for customer billing and payments."
                    buttonText="Stripe Setup"
                    isLoading={isLoading}
                    variant="primary"
                    style={{visibility: showStripeOnboard ? "visible" : "hidden"}}
                /> 
                {logType === 'xero' && (
                <Form.Group style={{display: "flex", flexWrap: "wrap", alignItems:'end'}}>
                    <Form.Label>Invoice Date</Form.Label>
                    <Form.Control name="invoiceDate" type="date" onChange={event => setInvoiceDate(event.target.value)}/>
                </Form.Group>  
                )}
                {logType === 'stripe' && (
                <Form.Group style={{display: "flex", flexWrap: "wrap", alignItems:'end'}}>
                    <Button onClick={() => setShowInvoices(true)}>View and Send Invoices</Button>
                </Form.Group>    
                )}
            </Form.Group>
        </Form>  
        <Invoices show={showInvoices} setShow={setShowInvoices}/> 
        <LogsTable height='70vh' logType={logType} logs={logs} editable={editable}/>
        </>
    )    
}

export default ServiceLogs