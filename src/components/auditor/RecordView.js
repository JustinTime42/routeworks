import {Accordion, Row, Col, Container, Button} from 'react-bootstrap'
import _ from 'lodash'
import { getDiff, sendToDB } from './utils'

const RecordView = ({records, org, docType, customers}) => {
    const getRecordType = (record) => {
        console.log(record)
        if (record.deleted) {
            return "Deleted"
        } 
        else if (record.created) {
            return "Created"
        }
         else {
            return "Modified"
        }
    }

    const flatten = (entry) => {
        if (typeof(entry) === 'object') {
            return _.flatMapDeep(entry).join(' ')
        } else return entry
    }

    const handleRevert = (record) => {
        const docPath = docType === 'audit_customers' ? 'customer' : 'service_logs'
        console.log(record)
        let confirmed = window.confirm("Revert this change to its 'Before' state?")
        if (confirmed && record.before) {
            const {cust_id, id, service_address, timestamp, ...changes} = getDiff(record)
            const newRecord = {}
            Object.keys(changes).forEach(item => {
                newRecord[item] = changes[item].before
            })
            //iterate through these other fields and write the before property
            sendToDB({...newRecord, id: record.cust_id}, `organizations/${org}/${docPath}`)
        }
    }

    return (
        <Accordion style={{height: "80vh", overflowY:'scroll'}}>
            { (records.length > 0) ? 
            records.map((record, i) => {  
                const flatRecord = getDiff(record)              
                const recordType = getRecordType(flatRecord)
                return (
                    <Accordion.Item eventKey={i} >
                        <Accordion.Header>
                            <Container>
                                <Row>                 
                                    <Col>Change Date: {new Date(flatRecord.timestamp.seconds * 1000).toUTCString()}</Col>
                                    <Col>{flatRecord.service_address}</Col>
                                    <Col>{customers[customers.findIndex(i=>i.id === record.cust_id)]?.cust_name}</Col>
                                    <Col>{recordType}</Col>
                                </Row>
                            </Container>  
                        </Accordion.Header>
                        <Accordion.Body>
                            {recordType === "Deleted" &&
                            <Col><Button onClick={() => handleRevert(record)}>Revert Change</Button></Col>} 
                            {recordType === "Deleted" || recordType === "Created" ? 
                            Object.keys({...flatRecord.deleted, ...flatRecord.created}).map(row => {
                                if ((row === 'timestamp') || (row === 'timestamp')) {
                                    console.log({...flatRecord})
                                    return (
                                        <Row>                                   
                                            <Col>{row}</Col>
                                            <Col>{new Date({...flatRecord.deleted, ...flatRecord.created, ...flatRecord.after}[row].seconds * 1000).toUTCString()}</Col>
                                        </Row>
                                    )
                                } else {
                                    return (
                                        <Row>                                            
                                            <Col>{row}</Col>
                                            <Col>{flatten({...flatRecord.deleted, ...flatRecord.created}[row])}</Col>
                                        </Row>
                                    )
                                } 
                            })
                            :
                            <>
                            <Row>
                                <Col><Button onClick={() => handleRevert(record)}>Revert Change</Button></Col>
                                <Col>Before</Col>
                                <Col>After</Col>
                                <hr/>
                            </Row>                            
                            {Object.keys(flatRecord).map((item,i) => {
                                if (item === 'timestamp') {
                                    return null
                                } else if (flatRecord[item]?.before || flatRecord[item]?.after) {
                                    return (                                        
                                        <Row>                                            
                                            <Col>{item}</Col>
                                            <Col>{flatten(flatRecord[item].before)}</Col>
                                            <Col>{flatten(flatRecord[item].after)}</Col>
                                        </Row>                                
                                    )
                                } else return null
                            })}
                            </>                            
                            }                             
                        </Accordion.Body>
                    </Accordion.Item>
                )
            }) : null
            }
        </Accordion>
    )
}

export default RecordView