import React, { Component } from 'react'
import { Button, Dropdown, DropdownButton, Modal, Form, Row, Col } from 'react-bootstrap'
import { CSVLink } from "react-csv";
import Can from '../auth/Can'
import { AuthConsumer } from "../authContext"
import { connect } from "react-redux"
import {showRouteEditor} from "../actions"

const mapStateToProps = state => {
    return {
        showEditor: state.showRouteEditor.showEditor
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onShowEditor: (show) => dispatch(showRouteEditor(show))
    }
}

class EditRouteButton extends Component {
    constructor(){
        super()
        this.state = {
            showModal: false,
            showDownload: false,
            startDate: '',
            endDate: '',
            logs: [],
            logType: '',
            invoiceDate: '',
            dueDate: '',
        }
    }

    headers = () => {
        let headers = []
        if (this.state.logType === "raw"){
            headers = [
                { label: "Customer Name", key: "cust_name" },
                { label: "status", key: "status" },
                { label: "Date", key: "date" },
                { label: "Time", key: "time" },
                { label: "Notes", key: "notes" },
                { label: "Driver", key: "user_name" },
                { label: "Tractor", key: "tractor" },
                { label: "Address", key: "address" },
                { label: "Price", key: "price"},
                { label: "Driver Earning", key: "driver_earning"}
            ]
        } else {
            headers = [
                { label: "ContactName", key: "cust_name" },
                { label: "EmailAddress", key: "cust_email" },
                { label: "POAddressLine1", key: "address" },
                { label: "POCity", key: "city" },
                { label: "PORegion", key: "state" },
                { label: "POPostalCode", key: "zip" },
                { label: "InvoiceNumber", key: "invoice_number" },
                { label: "Reference", key: "reference" },
                { label: "InvoiceDate", key: "invoiceDate" },
                { label: "DueDate", key: "dueDate" },
                { label: "Description", key: "description" },
                { label: "Quantity", key: "quantity" },
                { label: "UnitAmount", key: "price" },
                { label: "AccountCode", key: "accountCode" },
                { label: "TaxType", key: "taxType" },

            ]  
        }
        return headers        
    }  

    onSelect = (event) => {
        switch(event) {
            case "editor": return this.props.showEditor ? this.props.onShowEditor(false) : this.props.onShowEditor(true)
            case "logs": return this.showLogs()
            default: return
        }
    }

    showLogs = () => this.setState({showModal: true})

    onClose = () => this.setState({showModal: false, showDownload: false})
    
    setLogOptions = (event) => {
        console.log(event)
        switch(event) {
            case "xero": this.setState({logType: "xero"}); return
            case "raw": this.setState({logType: "raw"}); return
            default: this.setState({[event.target.name]: event.target.value}); return
        }
    } 

    onDownload = () => {
        const startDate = this.state.startDate.toLocaleString("en-US", {timeZone: "America/Anchorage"})
        const endDate = this.state.endDate.toLocaleString("en-US", {timeZone: "America/Anchorage"})
        const logType = this.state.logType
        fetch(`${process.env.REACT_APP_API_URL}/getlogs?type=${logType}&start=${startDate}&end=${endDate}`)
        .then(response => response.json())
        .then(logs => {
            if (this.state.logType === 'xero') {
                logs.forEach(entry => {
                    entry.invoiceDate = this.state.invoiceDate
                    entry.dueDate = this.state.dueDate
                    entry.quantity = 1
                    entry.accountCode = 4000
                    entry.taxType = 'Tax Exempt (0%)'
                    entry.description += ` ${new Date(entry.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})}`
                })
            } else {
                logs.forEach((item => { 
                item.date = new Date(item.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})       
                item.time = new Date(item.timestamp).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                })) 
            }
            console.log(logs)
            this.setState({logs: logs, showDownload: true})
        })
        .catch(error => console.log(error))
    } 

    render() {
        return (
            <AuthConsumer>
            {({ user }) => (
                <Can
                    role={user.role}
                    perform="admin:visit"
                    yes={() => (
                        <>                        
                        <DropdownButton title="Admin" onSelect={this.onSelect}>        
                            <Dropdown.Item key="editor" eventKey="editor">                                
                                    {this.props.showEditor ? "Show Route" : "Show Editor"}                               
                            </Dropdown.Item>
                            <Dropdown.Item key="logs" eventKey="logs">                                
                                    Show Logs                            
                            </Dropdown.Item>                   
                        
                        </DropdownButton>
                         <Modal show={this.state.showModal} onHide={this.onClose}>
                            <Modal.Header>Download Service Logs</Modal.Header>
                            <Modal.Body>
                                <Form>
                                    <Form.Group>                                    
                                        <Form.Label>Start Date</Form.Label>
                                        <Form.Control name="startDate" type="date" onChange={this.setLogOptions}/> 
                                        <Form.Label>End Date</Form.Label>
                                        <Form.Control name="endDate" type="date" onChange={this.setLogOptions}/>                                               
                                        <Row>
                                            <Col>
                                                <DropdownButton title={this.state.logType || "Type"} onSelect={this.setLogOptions}>        
                                                    <Dropdown.Item key="xero" eventKey="xero">                                
                                                            Xero                             
                                                    </Dropdown.Item>
                                                    <Dropdown.Item key="raw" eventKey="raw">                                
                                                            Raw                          
                                                    </Dropdown.Item> 
                                                </DropdownButton> 
                                            </Col>
                                            <Col>
                                                <Form.Label>Invoice Date</Form.Label>
                                                <Form.Control name="invoiceDate" type="date" onChange={this.setLogOptions}/> 
                                                <Form.Label>Due Date</Form.Label>
                                                <Form.Control name="dueDate" type="date" onChange={this.setLogOptions}/>  
                                            </Col>
                                        </Row>  
                                    </Form.Group>
                                    {
                                        this.state.showDownload ?
                                        <CSVLink data={this.state.logs} headers={this.headers()} filename={`servicelogs_${this.state.startDate}-${this.state.endDate}_${this.state.logType}.csv`}>
                                        Download
                                        </CSVLink> : <></>
                                    } 
                                </Form>                              
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="primary" onClick={this.onDownload}>Create File</Button>
                                <Button variant="secondary" onClick={this.onClose}>Close</Button>
                            </Modal.Footer>
                        </Modal>
                        </>             
                    )}
                    no={() => <p></p>}               
                />                            
            )}
            </AuthConsumer>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditRouteButton)
