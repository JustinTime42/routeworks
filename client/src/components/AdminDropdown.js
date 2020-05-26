import React, { Component } from 'react'
import { Button, Dropdown, DropdownButton, Modal, Col, Row, Form } from 'react-bootstrap'
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
            startDate: '',
            endDate: '',
            logs: []
        }
    }

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
        this.setState({[event.target.name]: event.target.value})
    } 

    onDownload = () => {

//         var url = new URL("https://snowline-route-manager.herokuapp.com/api/getlogs"),
//     params = {lat:35.696233, long:139.570431}
// Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
// fetch(url)
        const startDate = this.state.startDate.toLocaleString("en-US", {timeZone: "America/Anchorage"})
        const endDate = this.state.endDate.toLocaleString("en-US", {timeZone: "America/Anchorage"})
        fetch(`https://snowline-route-manager.herokuapp.com/api/getlogs?start=${startDate}&end=${endDate}`)
        .then(response => response.json())
        .then(logs => {
            logs.forEach((item => { 
                item.date = new Date(item.timestamp).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})       
                item.time = new Date(item.timestamp).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
                console.log(item.time)
            })) 
            this.setState({logs: logs, showDownload: true})
        })
        .catch(error => console.log(error))
    } 
    //figure out how to do query strings property to fix this error. 

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
                                 <Form.Group as={Row}>
                                    <Col sm={10}>
                                     <Form.Label column sm={2}>Start Date</Form.Label>
                                        <Form.Control name="startDate" type="date" onChange={this.onSetDate}/> 
                                    </Col>
                                    <Col sm={10}>
                                    <Form.Label column sm={2}>End Date</Form.Label>
                                        <Form.Control name="endDate" type="date" onChange={this.onSetDate}/>
                                    </Col>                                                                              
                                 </Form.Group>
                                 {
                                    this.state.showDownload ?
                                    <CSVLink data={this.state.logs} headers={this.headers} filename={`servicelogs_${this.state.date}.csv`}>
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
