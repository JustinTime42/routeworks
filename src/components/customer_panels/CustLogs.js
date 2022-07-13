import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Table, Button} from 'react-bootstrap'

const CustLogs = (props) => {
    const [entries, setEntries] = useState([])
    const activeProperty = useSelector(state => state.setActiveProperty.activeProperty)

    useEffect(() => {
        if(activeProperty?.key) getLogs()
    }, [activeProperty])

    const getLogs = () => {
        const offset = new Date().getTimezoneOffset() * 60000
        fetch(`${process.env.REACT_APP_API_URL}/getlogs/${activeProperty.key}`)
        .then(response => response.json())
        .then(data => {
            let logs = []
            data.forEach(item => {                
                item.timestamp = new Date(item.timestamp).toLocaleString("en-US", {timeZone: "America/Anchorage"})
                item.start_time = item.start_time ? new Date(item.start_time).toLocaleString("en-US", {timeZone: "America/Anchorage"}) : null
                item.end_time = item.end_time ? new Date(item.end_time).toLocaleString("en-US", {timeZone: "America/Anchorage"}) : null
                logs.push([item.timestamp, item.status, item.notes, item.description, item.user_name, item.tractor, item.start_time, item.end_time])
            })
            setEntries(logs)
            console.log(logs)
        }) 
        .catch(error => alert(error))
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
