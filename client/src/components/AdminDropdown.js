import React, { Component } from 'react'
import { Button, Dropdown, DropdownButton, Modal, Form } from 'react-bootstrap'
import { CSVLink } from "react-csv";


import Can from './Can'
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
            date: '',
            logs: []
        }
    }

    headers = [
        { label: "Customer Name", key: "cust_name" },
        { label: "status", key: "status" },
        { label: "Timestamp", key: "timestamp" },
        { label: "Notes", key: "notes" },
        { label: "Driver", key: "user_name" },
        { label: "Tractor", key: "tractor" },
        { label: "Address", key: "address" }
      ];

    onSelect = (event) => {
        switch(event) {
            case "editor": return this.props.showEditor ? this.props.onShowEditor(false) : this.props.onShowEditor(true)
            case "logs": return this.showLogs()
            default: return
        }
    }

    showLogs = () => this.setState({showModal: true})

    onClose = () => this.setState({showModal: false, showDownload: false})
    
    onSetDate = (event) => {
        const date = event.target.value.toLocaleString("en-US", {timeZone: "America/Anchorage"})
        this.setState({date: date}, () => console.log(this.state.date))
    } 

    onDownload = () => {
        const since = this.state.date.toLocaleString("en-US", {timeZone: "America/Anchorage"})
        fetch(`https://snowline-route-manager.herokuapp.com/api/getlogs/${since}`)
        .then(response => response.json())
        .then(logs => {
            logs.forEach((item => {
               
                item.timestamp = new Date(item.timestamp).toLocaleString("en-US", {timeZone: "America/Anchorage"})
            })) 
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
                                     <Form.Label column sm={2}>Date</Form.Label>
                                        <Form.Control name="date" type="date" onChange={this.onSetDate}/>
                                        {
                                            this.state.showDownload ?
                                            <CSVLink data={this.state.logs} headers={this.headers} filename={`servicelogs_${this.state.date}.csv`}>
                                            Download
                                            </CSVLink> : <></>
                                        }                                        
                                 </Form.Group>
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
                    
            // put authconsumer and Can stuff here to only show this if user is admin

        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditRouteButton)
