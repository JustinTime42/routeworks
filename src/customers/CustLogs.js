import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {  Button, Modal} from 'react-bootstrap'
import { collection, query, where, getDocs, or } from "firebase/firestore";

import { db } from '../firebase'
import LogsTable from './LogsTable';

const CustLogs = ({id, admin, hideModal, show}) => {
    const [editable, setEditable] = useState(false)
    const activeProperty = useSelector(state => state.setActiveProperty.activeProperty)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    //const logs = useSelector(state => state.setLogs.entries)
    const [ logs, setLogs ] = useState([])
    const dispatch = useDispatch()

    useEffect(() => {
        console.log(id)
        getLogs()
    },[id])
    
    const getLogs = async() => {
        // cust_id is mislabelled in the service_logs database. It is actually the service location id
        const q = query(collection(db, `organizations/${organization}/service_logs`), or(where('loc_id', '==', id), where('id', '==', id)))
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
        setLogs(logs.sort((a,b) => b.timestamp - a.timestamp))
    }

    return (
        <Modal show={show} onHide={hideModal} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Service Logs</Modal.Title> 
            </Modal.Header>
            <Modal.Body>
                <Button style={{float:"right", marginLeft:"1em"}} onClick={getLogs}>Refresh</Button>
                {(['Supervisor','Admin'].includes(currentUser.claims.role) && admin) ? 
                    <Button style={{visibility: logs.length ? 'visible' : 'hidden', float: "right"}} onClick={() => setEditable(!editable)}>
                        {!editable ? "Start Editing" : "Stop Editing"}
                    </Button>
                : null }
                <LogsTable height="70vh" width="1000px" logType="stripe" editable={editable} isAdmin={admin} logs={logs}/> 
            </Modal.Body>
        </Modal>
    )   
}

export default CustLogs
