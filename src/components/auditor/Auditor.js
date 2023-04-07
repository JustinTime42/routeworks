import {useState, useEffect} from "react"
import { useSelector, useDispatch } from "react-redux"
import { Timestamp, query, collection, where, getDocs } from "firebase/firestore"
import { db } from "../../firebase"
import { Form, Dropdown, DropdownButton, Button } from "react-bootstrap"
import RecordView from "./RecordView"
import { setActiveItem } from "../../actions"
import { SET_ACTIVE_PROPERTY } from "../../constants"
import { getDiff } from "./utils"
import { getBadChanges } from "./utils"

const Auditor = () => {
    const [docType, setDocType] = useState('') 
    const [startDate, setStartDate ] = useState('')
    const [endDate, setEndDate ] = useState('')    
    const [records, setRecords] = useState([])
    const organization = useSelector((state) => state.setCurrentUser.currentUser.claims.organization)
    const customer = useSelector(state => state.setActiveProperty.activeProperty)
    const customers = useSelector(state => state.requestAllAddresses.addresses)

    const dispatch = useDispatch()

    useEffect(() => {
        clearActiveCustomer()
    },[])

    const onDownload = async () => {
        setRecords([])
        const offset = new Date().getTimezoneOffset() * 60000
        const start = Timestamp.fromDate(new Date(Date.parse(startDate) + offset))
        let end = Timestamp.fromDate(new Date(Date.parse(endDate) + offset + 86400000))// new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1) + offset).toISOString()
        let results = []
        let q
        if (customer.id) {
            q = query(
                collection(db, `organizations/${organization}/${docType}`), 
                where('timestamp', '>', start), 
                where('timestamp', '<=', end),
                where('cust_id', '==', customer.id))
        } else {
            q = query(
                collection(db, `organizations/${organization}/${docType}`), 
                where('timestamp', '>', start), 
                where('timestamp', '<=', end))
        }      
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach((doc) => {
            const record = {...doc.data(), id: doc.id}

            results.push(record)
        })
        console.log(results)
        setRecords(results)
    }

    const clearActiveCustomer = () => {
        dispatch(dispatch(setActiveItem({}, customers, SET_ACTIVE_PROPERTY)) )
    }

    const getTypeTitle = () => {
        switch (docType) {
            case 'audit_logs': return "Service Logs"
            case 'audit_customers': return "Customers"
            default: return "Select Type"
        }
    }

    const marchNine = () => {
        setDocType("audit_customers")
        getBadChanges().then(results => setRecords(results))
    }

    return (
        <>
        <Form style={{display: "flex", flexWrap: "wrap", gap:'1em', width:'80%', justifyContent: "center", margin: "5px", alignItems:'end'}}>
            <Form.Group>
                <Form.Label >Start Date</Form.Label>
                <Form.Control name="startDate" type="date" onChange={event => setStartDate(event.target.value)}/> 
            </Form.Group>                                
            <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control name="endDate" type="date" onChange={event => setEndDate(event.target.value)}/>
            </Form.Group>  
            <DropdownButton title={getTypeTitle()} onSelect={event => setDocType(event)}>        
                <Dropdown.Item key="audit_logs" eventKey="audit_logs">                                
                    Service Logs                            
                </Dropdown.Item>
                <Dropdown.Item key="audit_customers" eventKey="audit_customers">                                
                    Customer Logs                        
                </Dropdown.Item> 
            </DropdownButton> 
            <Button onClick={onDownload}>Generate Report</Button>
            <Form.Label>{customer?.cust_name || null}</Form.Label>
            <Button style={{visibility:customer.id ? "visible" : "hidden"}} onClick={clearActiveCustomer}>Clear Customer</Button>
        </Form>
        <RecordView customers={customers} org={organization} docType={docType} records={records}/>
        </>
    )
}

export default Auditor