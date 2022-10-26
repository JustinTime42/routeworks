import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {Modal, Button} from 'react-bootstrap'
import { CSVLink } from 'react-csv'
import { hideModal } from '../actions'

const RawCustomerData = (props) => {
    const customers = useSelector(state => state.requestAllAddresses.addresses)
    const modals = useSelector(state => state.whichModals.modals)

    customers.forEach(i => {
        i.routesAssigned = Object.values(i.routesAssigned)
    })
    const dispatch = useDispatch()

    return (
        <Modal show={modals.includes('All Customers')} onHide={props.close}>
            <Modal.Header>Download Raw Customer Table</Modal.Header>
            <Modal.Body>   
                <CSVLink data={customers} filename={`all-customer-data.csv`}>
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