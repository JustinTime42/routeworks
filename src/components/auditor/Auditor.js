import React, {useState } from "react"
import { useSelector } from "react-redux"
import _ from 'lodash'

const Auditor = () => {
    const [docType, setDocType] = useState('audit_logs') 
    const [startDate, setStartDate ] = useState('')
    const [endDate, setEndDate ] = useState('')
    const [customer, setCustomer] = useState('')
    const [records, setRecords] = useState([])
    const organization = useSelector((state) => state.setCurrentUser.currentUser.claims.organization)

    const onDownload = async () => {
        const offset = new Date().getTimezoneOffset() * 60000
        // const start = Timestamp.fromDate(new Date(Date.parse(startDate) + offset))
        // let end = Timestamp.fromDate(new Date(Date.parse(endDate) + offset + 86400000))// new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1) + offset).toISOString()
        
        // const q = query(
        //     collection(db, `organizations/${organization}/${docType}`), 
        //     where('timestamp', '>', start), 
        //     where('timestamp', '<=', end),
        //     // find out how to add optional cust_id / id depending on which type to select specific customer
        //     // might need to research if wildcards work in firebase queries
        // )
        // const querySnapshot = await getDocs(q)
        // //now we have the logs, but now we have to compare, filter fields, and sort by timestamp
        // querySnapshot.forEach((doc) => {
        //     const record = doc.data()

        // })

    }
}

export default Auditor