import React, { useEffect, useState } from 'react'
import {Modal, Button} from 'react-bootstrap'
import axios from 'axios'
import { CSVLink } from 'react-csv'

const RawCustomerData = (props) => {
    const [showDownloadLink, setShowDownloadLink] = useState(false)
    const [customers, setCustomers] = useState([])
    
    useEffect(() => {
        console.log(customers)
    })
    const onDownload = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/properties`)
        .then(results => {  
            console.log(results.data)
            let customerArray = []
            results.data.forEach(item => {
                customerArray.push(...customerArray)                
            })
            setCustomers(customerArray)
            setShowDownloadLink(true)
        })
        .catch(err => console.log(err))
    }

    return (
        <Modal show={props.show} onHide={props.close}>
            <Modal.Header>Download Raw Customer Table</Modal.Header>
            <Modal.Body>                    
                    {
                        showDownloadLink ?
                        <CSVLink data={customers} filename={`all-customer-data.csv`}>
                        Download
                        </CSVLink> : <></>
                    } 
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onDownload}>Create File</Button>
                <Button variant="secondary" onClick={props.onClose}>Close</Button>
            </Modal.Footer>            
        </Modal>
    )
}
export default RawCustomerData