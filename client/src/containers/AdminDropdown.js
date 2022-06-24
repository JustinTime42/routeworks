import React, { Component } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { connect } from "react-redux"
import {showRouteEditor} from "../actions"
import ServiceLogs from "../components/ServiceLogs"
import CustomerContact from '../components/CustomerContact'
import RawCustomerData from '../components/RawCustomerData'
import UserEditor from '../components/editor_panels/UserEditor'

const mapStateToProps = state => {
    return {
        showEditor: state.showRouteEditor.showEditor,
        currentUser: state.setCurrentUser.currentUser
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onShowEditor: (show) => dispatch(showRouteEditor(show))
    }
}

class AdminDropdown extends Component {
    constructor(props){
        super(props)
        this.state = {
            showLogsMenu: false,
            showContactsMenu: false,
            showRawTableModal: false,
            showUserEditor: false,
            //userRole: props.currentUser.get('appRole')
        }
    }

    onSelect = (event) => {
        switch(event) {
            case "editor": return this.props.showEditor ? this.props.onShowEditor(false) : this.props.onShowEditor(true)
            case "logs": return this.setState({showLogsMenu: true})
            case "contact": return this.setState({showContactsMenu: true})
            case "rawTable": return this.setState({showRawTableModal: true})
            case "userEditor": return this.setState({showUserEditor: true})
            default: return
        }
    }

    onClose = () => this.setState({showLogsMenu: false, showDownload: false, showContactsMenu: false, showRawTableModal: false, showUserEditor: false})
    
    render() {
       // if(this.state.userRole === 'Admin') {
            return (
                <>                        
                        <DropdownButton size="sm" title="Admin" onSelect={this.onSelect}>        
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
                            <Dropdown.Item key="userEditor" eventKey="userEditor">
                                User Editor
                            </Dropdown.Item>
                        </DropdownButton>
                        <ServiceLogs show={this.state.showLogsMenu} onClose={this.onClose} /> 
                        <CustomerContact show={this.state.showContactsMenu} onClose={this.onClose} />  
                        <RawCustomerData show={this.state.showRawTableModal} onClose={this.onClose} />
                        <UserEditor show={this.state.showUserEditor} onClose={this.onClose} />                      
                    </>
            )
     //  } else return null
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminDropdown)
