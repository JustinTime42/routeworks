import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {Modal, Button} from 'react-bootstrap'
import { CSVLink } from 'react-csv'
import { hideModal } from '../actions'
import { useEffect } from 'react'
import { useState } from 'react'

const RawCustomerData = (props) => {    
    const customers = useSelector(state => state.requestAllAddresses.addresses)
    const [newList, setNewList] = useState([])
    const modals = useSelector(state => state.whichModals.modals)

    useEffect(() => {
        if (customers.length > 0) {
            console.log(customers)
            let temp = [...customers]
            temp.forEach(i => {
                i.routesAssigned = Object.values(i.routesAssigned)
            })
            setNewList(temp)
        }
    },[customers])

    const dispatch = useDispatch()

    return (
        <Modal show={modals.includes('All Customers')} onHide={props.close}>
            <Modal.Header>Download Raw Customer Table</Modal.Header>
            <Modal.Body>   
                <CSVLink data={newList} filename={`all-customer-data.csv`}>
                Download
                </CSVLink>             
            </Modal.Body>
            <Modal.Footer>                
                <Button variant="secondary" onClick={() => dispatch(hideModal('All Customers'))}>Close</Button>
            </Modal.Footer>            
        </Modal>
    )
}
export default RawCustomerData