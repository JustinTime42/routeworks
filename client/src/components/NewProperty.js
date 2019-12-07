import React, { Component } from 'react'
import { Button, Modal, Form, Row, Col } from 'react-bootstrap'
import { connect } from 'react-redux'
import axios from "axios"
import { requestAllAddresses } from '../actions'

const mapStateToProps = state => {
    return {        
        addresses: state.requestAllAddresses.addresses, 
    }
}

const mapDispatchToProps = (dispatch) => {
    return {    
        onGetAllAddresses: () => dispatch(requestAllAddresses()),
    }
}

class NewProperty extends Component {
    constructor(props){
        super(props)
        this.state = {
            address: '',
            cust_name: '',
            cust_phone: '',
            surface_type: '',
            is_new: false,
            notes: ''
        }
    }

    onSubmit = () => {
        axios.post('https://snowline-route-manager.herokuapp.com/api/newproperty', 
            {
                ...this.state
            }
        )
        .then(res => {
            this.props.onGetAllAddresses() 
            console.log(res)
        })
        .catch(err => console.log(err)) 
    }

    onChange = (event) => {
        const name = event.target.name
        const value = event.target.value
        console.log(value)
        name === "is_new" ? 
        this.setState(prevState => ({
            is_new: !prevState.is_new
        })) : 
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
                            <Row>
                                <Col>
                                    <Form.Group as={Row}>
                                        <Form.Label>Surface Type</Form.Label>
                                        <Form.Control name="surface_type" as="select" onChange={this.onChange}>
                                            <option value="select">Select</option>
                                            <option value="paved">Paved</option>
                                            <option value="gravel">Gravel</option>
                                            <option value="partial">Partial</option>
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Check 
                                        name="is_new"
                                        type="checkbox"
                                        value="new"
                                        label="New Property?"
                                        onChange={this.onChange}
                                    />
                                </Col>
                            </Row>
                            <Form.Group>
                                <Form.Label>Notes</Form.Label>
                                    <Form.Control name="notes" type="textarea" rows="3" placeholder="notes" onChange={this.onChange}/>
                            </Form.Group>
                        </Form> 
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.onSubmit}>Save Changes</Button>
                        <Button variant="secondary" onClick={this.props.close}>Close</Button>
                    </Modal.Footer>
                </Modal>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewProperty)