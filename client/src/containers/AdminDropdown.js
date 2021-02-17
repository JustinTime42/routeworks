import React, { Component } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import Can from '../auth/Can'
import { AuthConsumer } from "../authContext"
import { connect } from "react-redux"
import {showRouteEditor} from "../actions"
import ServiceLogs from "../components/ServiceLogs"
import CustomerContact from '../components/CustomerContact'
import RawCustomerData from '../components/RawCustomerData'

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
    constructor(props){
        super(props)
        this.state = {
            showLogsMenu: false,
            showContactsMenu: false,
            showRawTableModal: false,
        }
    }

    onSelect = (event) => {
        switch(event) {
            case "editor": return this.props.showEditor ? this.props.onShowEditor(false) : this.props.onShowEditor(true)
            case "logs": return this.showLogs()
            case "contact": return this.showContacts()
            case "rawTable": return this.showRawTableModal()
            default: return
        }
    }

    showRawTableModal = () => this.setState({showRawTableModal: true})
    showLogs = () => this.setState({showLogsMenu: true})
    showContacts = () => this.setState({showContactsMenu: true})
    onClose = () => this.setState({showLogsMenu: false, showDownload: false, showContactsMenu: false, showRawTableModal: false})
    
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
                            <Dropdown.Item key="contact" eventKey="contact">
                                Customer Contact 
                            </Dropdown.Item>
                            <Dropdown.Item key="rawTable" eventKey="rawTable">
                                All Customer Data
                            </Dropdown.Item>
                        </DropdownButton>
                        <ServiceLogs show={this.state.showLogsMenu} onClose={this.onClose} /> 
                        <CustomerContact show={this.state.showContactsMenu} onClose={this.onClose} />  
                        <RawCustomerData show={this.state.showRawTableModal} onClose={this.onClose} />                      
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
