import React, { Component } from 'react'
import { Button, Modal } from 'react-bootstrap'

class NewProperty extends Component {
    constructor(){
        super()
        this.state = {
            show: false
        }
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.handleClose}>
                    <Modal.Header>[Placeholder]</Modal.Header>
                    <Modal.Body>
                        <form>
                            <input onChange={this.onSetRouteName} type="text" name="routeName" placeholder="[placeholder]"></input>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.props.close}>
                        Close
                        </Button>
                        <Button variant="primary" onClick={this.handleSave}>
                        Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
        )
    }
}

export default NewProperty