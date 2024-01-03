import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {  Button} from 'react-bootstrap'
import { collection, query, where, getDocs, or } from "firebase/firestore";
import { setLogs } from '../../actions';
import { db } from '../../firebase'
import LogsTable from '../service_logs/LogsTable';

const CustLogs = (props) => {
    const [editable, setEditable] = useState(false)
    const activeProperty = useSelector(state => state.setActiveProperty.activeProperty)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const logs = useSelector(state => state.setLogs.entries)
    const dispatch = useDispatch()

    useEffect(() => {
        getLogs()
    },[activeProperty])
    
    const getLogs = async() => {
        const q = query(collection(db, `organizations/${organization}/service_logs`), or(where('loc_id', '==', activeProperty.id), where('id', '==', activeProperty.id)))
        const querySnapshot = await getDocs(q);
        let logs = []
        querySnapshot.forEach((doc) => {
            let entry = {...doc.data(), id: doc.id}
            logs.push({
                ...entry,
                timestamp: entry.timestamp.toDate(),
                ...(!!entry.startTime) && {startTime: entry.startTime.toDate()},
                ...(!!entry.endTime) && {endTime: entry.endTime.toDate()},
            })     
        })        
        logs.sort((a,b) => b.timestamp - a.timestamp)
        dispatch(setLogs(logs.sort((a,b) => b.timestamp - a.timestamp)))
    }

    return (
        <div style={{height:'75vh'}}>
        <Button style={{float:"right", marginRight:"3px"}} onClick={getLogs}>Refresh</Button>
        {(['Supervisor','Admin'].includes(currentUser.claims.role) && props.isAdmin) ? 
            <Button style={{visibility: logs.length ? 'visible' : 'hidden'}} onClick={() => setEditable(!editable)}>
                {!editable ? "Start Editing" : "Stop Editing"}
            </Button>
        : null }
        <LogsTable height="90%" logType="customer" editable={editable} isAdmin={props.admin}/> 
        </div>
    )
}

export default CustLogs
