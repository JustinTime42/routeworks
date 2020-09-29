import React, { useState } from 'react'
import {Modal, Button} from 'react-bootstrap'
import axios from 'axios'
import { CSVLink } from 'react-csv'

RawCustomerData = () => {
    const [showDownloadLink, setShowDownloadLink] = useState(false)
    const [customers, setCustomers] = useState([])
    
    const onDownload = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/properties`)
        .then(results => {  
            let customerArray = []
            results.data.data.forEach(item => {
                customerArray.push.apply(customerArray, item)                
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