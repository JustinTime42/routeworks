import {Modal, Button} from 'react-bootstrap'
import { CSVLink } from 'react-csv'
import _ from 'lodash'
import { useState } from 'react'

const RawCustomerData = ({show, onClose, customers}) => {    
    const [newList, setNewList] = useState([])
    const [linkVisible, setLinkVisible] = useState(false)

    const hideModal = () => {
        onClose('All Customers')
        setLinkVisible(false)
    }
    const buildCustList = () => {
        let temp = _.cloneDeep(customers)
        temp.forEach(i => {
            i.routesAssigned = Object.values(i.routesAssigned)
            if(i.date_created) i.date_created = i.date_created.toDate()
        })            
        setNewList(temp)
        setLinkVisible(true)
    }
    
    return (
        <Modal show={show} onHide={hideModal}>
            <Modal.Header>Download Raw Customer Table</Modal.Header>
            <Modal.Body>   
                <Button variant='primary' onClick={buildCustList}>Build Customer CSV</Button>
                <CSVLink 
                    data={newList} 
                    filename={`all-customer-data.csv`}
                    style={{visibility: linkVisible ? 'visible' : 'hidden'}}
                    >
                    Download
                </CSVLink>             
            </Modal.Body>
            <Modal.Footer>                
                <Button variant="secondary" onClick={hideModal}>Close</Button>
            </Modal.Footer>            
        </Modal>
    )
}
export default RawCustomerData
