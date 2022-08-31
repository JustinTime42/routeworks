import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Table, Button} from 'react-bootstrap'
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../../firebase'

const CustLogs = (props) => {
    const [entries, setEntries] = useState([])
    const activeProperty = useSelector(state => state.setActiveProperty.activeProperty)

    const getLogs = async() => {
        const q = query(collection(db, 'service_logs'), where('cust_id', '==', activeProperty.id))
        const querySnapshot = await getDocs(q);
        let logs = []
        querySnapshot.forEach((doc) => {
            let item = {...doc.data(), id: doc.id}
            console.log(item.timestamp)
             item.timestamp = item.timestamp.toDate().toLocaleString("en-US", {timeZone: "America/Anchorage"}) //new Date(item.timestamp).toLocaleString("en-US", {timeZone: "America/Anchorage"})
            item.startTime = item.startTime ? item.startTime.toDate().toLocaleString("en-US", {timeZone: "America/Anchorage"}) :null //new Date(item.startTime * 1000).toLocaleString("en-US", {timeZone: "America/Anchorage"}) : null
            item.endTime = item.endTime ? item.endTime.toDate().toLocaleString("en-US", {timeZone: "America/Anchorage"}) :null// new Date(item.endTime * 1000).toLocaleString("en-US", {timeZone: "America/Anchorage"}) : null
            logs.push([item.timestamp, item.status, item.notes, item.description, item.driver, item.tractor, item.startTime, item.endTime])        
        })
        console.log(logs)
        setEntries(logs.sort((a,b) => a.timestamp - b.timestamp))
    }

    return (
        <>
        <Button style={{float:"right", marginRight:"3px"}} onClick={getLogs}>Refresh</Button>
        <Table style={{display: "block", height:props.height, overflow:"auto"}} striped bordered>            
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Description</th>
                    <th>Driver</th>
                    <th>Tractor</th>
                    { activeProperty.contract_type === 'Hourly' ? <th>Start Time</th> : null } 
                    { activeProperty.contract_type === 'Hourly' ? <th>End Time</th> : null }
                </tr>
            </thead>
            <tbody>
            {
                entries.map((logEntry, i) => (
                    <tr key={i}>
                        { 
                            Object.values(logEntry).map((element, i) => <th key={i}>{element}</th>)
                        }                        
                    </tr>
                ))
            }
            </tbody>
        </Table>      
        </>
    )
}

export default CustLogs
