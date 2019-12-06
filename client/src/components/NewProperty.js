import React, { Component } from 'react'
import { Button, Modal, Form, Row, Col } from 'react-bootstrap'

class NewProperty extends Component {
    constructor(props){
        super(props)
        this.state = {
            show: false,
            address: '',
            cust_name: '',
            cust_phone: '',
            surface_type: '',
            is_new: false,
            notes: ''
        }
    }

    onSubmit = () => {
        console.log(this.state)
   
    }

    onChange = (event) => {
        console.log(event.target.value)
        const name = event.target.name
        const value = event.target.value
        this.setState({
            [name]: value
        })
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.handleClose}>
                    <Modal.Header>New Property</Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Address</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="address" type="text" placeholder="Address" onChange={this.onChange}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Name</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="cust_name" type="text" placeholder="Name" onChange={this.onChange}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Phone</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="cust_phone" type="text" placeholder="Phone" onChange={this.onChange}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label>Surface Type</Form.Label>
                                <Form.Control as="select" onChange={this.onChange}>
                                    <option value="paved">Paved</option>
                                    <option value="gravel">Gravel</option>
                                    <option value="partial">Partial</option>
                                </Form.Control>
                            </Form.Group>
                            
                            
                        <Form.Control type="textarea" rows="3" />
                        <Button variant="primary" onClick={this.onSubmit}>Save Changes</Button>
                        </Form>        
                        {/* address: req.body.address,
                        cust_name: req.body.cust_name,
                        cust_phone: req.body.cust_phone,
                        surface_type: req.body.surface_type,
                        is_new: req.body.is_new,
                        notes: req.body.notes */}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.props.close}>
                        Close
                        </Button>
                        
                        
                    </Modal.Footer>
                </Modal>
        )
    }
}

export default NewProperty