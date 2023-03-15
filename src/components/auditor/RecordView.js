import {Accordion, Row, Col, Container} from 'react-bootstrap'
import _ from 'lodash'
const RecordView = ({records}) => {
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

    return (
        <Accordion style={{height: "80vh", overflowY:'scroll'}}>
            { (records.length > 0) ? 
            records.map((record, i) => {                
                const recordType = getRecordType(record)                
                return (
                    <Accordion.Item eventKey={i} >
                        <Accordion.Header>
                            <Container>
                                <Row>
                                    <Col>Change Date: {new Date(record.timestamp.seconds * 1000).toUTCString()}</Col>
                                    <Col>{record.service_address}</Col>
                                    <Col>{recordType}</Col>
                                </Row>
                            </Container>  
                        </Accordion.Header>
                        <Accordion.Body>
                            {recordType === "Deleted" || recordType === "Created" ? 
                            Object.keys({...record.deleted, ...record.created}).map(row => {
                                if ((row === 'timestamp') || (row === 'timestamp')) {
                                    console.log({...record})
                                    return (
                                        <Row>
                                            <Col>{row}</Col>
                                            <Col>{new Date({...record.deleted, ...record.created, ...record.after}[row].seconds * 1000).toUTCString()}</Col>
                                        </Row>
                                    )
                                } else {
                                    return (
                                        <Row>
                                            <Col>{row}</Col>
                                            <Col>{flatten({...record.deleted, ...record.created}[row])}</Col>
                                        </Row>
                                    )
                                } 
                            })
                            :
                            <>
                            <Row>
                                <Col></Col>
                                <Col>Before</Col>
                                <Col>After</Col>
                            </Row>                            
                            {Object.keys(record).map((item,i) => {
                                if (item === 'timestamp') {
                                    return null
                                } else if (record[item]?.before || record[item]?.after) {
                                    return (                                        
                                        <Row>
                                            <Col>{item}</Col>
                                            <Col>{flatten(record[item].before)}</Col>
                                            <Col>{flatten(record[item].after)}</Col>
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