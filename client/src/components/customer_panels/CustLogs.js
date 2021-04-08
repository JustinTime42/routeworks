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
        fetch(`${process.env.REACT_APP_API_URL}/getlogs/${activeProperty.key}`)
        .then(response => response.json())
        .then(data => {
            let logs = []
            data.forEach(item => {                
                item.timestamp = new Date(item.timestamp).toLocaleString("en-US", {timeZone: "America/Anchorage"})
                logs.push([item.timestamp, item.status, item.notes, item.description, item.user_name])
            })
            setEntries(logs)
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
