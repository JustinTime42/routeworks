import React, { useState, useEffect } from 'react'
import {Modal, Form, Button, Row, Col} from 'react-bootstrap'
import { doc, onSnapshot, query, where, getDocs, collection } from 'firebase/firestore'
import { db } from '../firebase'
import { CSVLink } from 'react-csv'
import { useSelector } from 'react-redux'

const CustomerContact = (props) => {
    const [allTags, setAllTags] = useState([])
    const [selectedTags, setSelectedTags] = useState([])
    const [showDownloadLink, setShowDownloadLink] = useState(false)
    const [customers, setCustomers] = useState([])
    const modals = useSelector(state => state.whichModals.modals)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)


    useEffect(() => {
        const unsub = onSnapshot(doc(db, `organizations/${organization}/tags/`, 'tags'), (doc) => {
            if (doc.data()) {
                setAllTags([...doc.data().tags])
            }            
        })
        return () => {
            unsub()
        }
    }, [])

    useEffect(() => {
        const emailsField = document.getElementById('customer-emails')
        if (emailsField) {
            emailsField.value = customers
        }
        console.log(customers)
    }, [customers])

    const toggleTags = (event) => {
        const {target: {name, value} } = event       
        if (selectedTags.includes(name)) {
            const newTags = selectedTags.filter(tag => tag !== name)
            setSelectedTags(newTags)
        } else {
            setSelectedTags(prev => [...prev, name])
        }
    }

    const copyToClipboard = () => {
        const emails = document.getElementById('customer-emails')
        emails.select()
        emails.setSelectionRange(0, 99999)
        navigator.clipboard.writeText(emails.value)
    }

    const onDownload = () => {
        let contactList = []
        selectedTags.forEach(async(tag, i) => {
            console.log(tag)
            const q = query(collection(db, `organizations/${organization}/customer`), where("tags", "array-contains", tag))
            const querySnapshot = await getDocs(q)
            querySnapshot.forEach(doc => {
                let customer = {...doc.data(), id: doc.id}
                contactList.push(customer.cust_email)
            })            
            setCustomers([...new Set(contactList)])            
        })
    }

    const headers = [
        { label: "Customer Name", key: "cust_name" },
        { label: "Service Address", key: "service_address" },
        { label: "Customer Email", key: "cust_email" },
        { label: "Customer Email 2", key: "cust_email2" },
        { label: "Tags", key: "tags" }
    ]

    return (
        <Modal show={modals.includes('Contact')} onHide={props.close}>
            <Modal.Header>Download Customer Contact Info</Modal.Header>
            <Modal.Body style={{display: 'flex', flexWrap:'nowrap'}}>
                <Form>
                    <Form.Group as={Row}>
                        <Col>
                        <Form.Label>Select By Tags</Form.Label>
                        {
                            allTags.map(tag => {
                                return (
                                    <Form.Check   
                                        key={tag}                                                       
                                        name={tag}
                                        type="checkbox"
                                        label={tag}
                                        checked = {selectedTags.includes(tag) || false}
                                        onChange={toggleTags}
                                    /> 
                                )                            
                            })
                        }
                        </Col>
                        
                        <Col>
                            <Button size='sm' onClick={copyToClipboard}>Copy To Clickboard</Button>
                            <Form.Control style={{overflowY:'scroll'}} id="customer-emails" name="notes" as="textarea" rows="3" value={customers} readOnly={true}/>
                        </Col>
                    </Form.Group>
                    
                    
                    {
                        // showDownloadLink ?
                        // <CSVLink data={customers} headers={headers} filename={`customers_${selectedTags.toString()}.csv`}>
                        // Download
                        // </CSVLink> : <></>
                    } 

                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onDownload}>Create File</Button>
                <Button variant="secondary" onClick={props.onClose}>Close</Button>
            </Modal.Footer>            
        </Modal>
    )
}

export default CustomerContact

