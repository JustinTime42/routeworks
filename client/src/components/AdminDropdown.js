import React, { Component } from 'react'
import { Button, Dropdown, DropdownButton, Modal, Form,  } from 'react-bootstrap'

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
            showModal: false
        }
    }

    onSelect = (event) => {
        switch(event) {
            case "editor": return this.props.showEditor ? this.props.onShowEditor(false) : this.props.onShowEditor(true)
            case "logs": return this.showLogs()
        }
    }

    showLogs = () => {
        this.setState({showModal: true})
    }

    onClose = () => {
        this.setState({showModal: false})
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
                                         <Form.Control name="date" type="date" onChange={this.onChange}/>
                                    
                                 </Form.Group>
                             </Form> 
                         </Modal.Body>
                         <Modal.Footer>
                             <Button variant="secondary" onClick={this.onClose}>Close</Button>
                         </Modal.Footer>
                     </Modal>
                     </>
                                               
                    )}
                    no={() => <p>can't</p>}               
                />                            
            )}
            </AuthConsumer>
                    
            // put authconsumer and Can stuff here to only show this if user is admin

        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditRouteButton)
