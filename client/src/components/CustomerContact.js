import React, { useState, useEffect } from 'react'
import {Modal, Form, Button} from 'react-bootstrap'
import axios from 'axios'
import { CSVLink } from 'react-csv'

const CustomerContact = (props) => {
    const [allTags, setAllTags] = useState([])
    const [selectedTags, setSelectedTags] = useState([])
    const [showDownloadLink, setShowDownloadLink] = useState(false)
    const [customers, setCustomers] = useState([])

    useEffect(() => {      
        const getTags = async () => {
            const result = await axios(
                `${process.env.REACT_APP_API_URL}/alltags`,
            )
           setAllTags(result.data)
        }  
        getTags()
    }, [])

    const toggleTags = (event) => {
        const {target: {name, value} } = event       
        if (selectedTags.includes(name)) {
            const newTags = selectedTags.filter(tag => tag !== name)
            setSelectedTags(newTags)
        } else {
            setSelectedTags(prev => [...prev, name])
        }
    }

    const onDownload = () => {
        let tagParams = []
        selectedTags.forEach((tag, i) => {
            if(i === 0){tagParams.push(`?tags=${tag}`)}
            else{tagParams.push(`&tags=${tag}`)}
        })
        axios.get(`${process.env.REACT_APP_API_URL}/contactinfo${tagParams.join('')}`)
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

    const headers = [
        { label: "Customer Name", key: "cust_name" },
        { label: "Service Address", key: "address" },
        { label: "Customer Email", key: "cust_email" },
        { label: "Tags", key: "tags" }
    ]

    return (
        <Modal show={props.show} onHide={props.close}>
            <Modal.Header>Download Customer Contact Info</Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
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
                    </Form.Group>
                    {
                        showDownloadLink ?
                        <CSVLink data={customers} headers={headers} filename={`customers_${selectedTags.toString()}.csv`}>
                        Download
                        </CSVLink> : <></>
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

