import React, { Component } from 'react'
import { Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap'
import { connect } from 'react-redux'
import axios from "axios"
import { requestAllAddresses, getRouteProperties } from '../actions'

const mapStateToProps = state => {
    return {         
        activeProperty: state.setActiveProperty.activeProperty,
        activeRoute: state.setActiveRoute.activeRoute,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onGetAllAddresses: () => dispatch(requestAllAddresses()),
        onGetRouteProperties: (route) => dispatch(getRouteProperties(route))        
    }
}

class NewProperty extends Component {
    constructor(props){
        super(props)
        this.state = {
            activeProperty: {...this.props.activeProperty},
            api: this.props.activeProperty ? "editproperty" : "newproperty",
            deleteAlert: false
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps.activeProperty !== this.props.activeProperty){
          this.setState({ activeProperty: {...this.props.activeProperty}, api: this.props.activeProperty ? "editproperty" : "newproperty" })
        }
      }

    onChange = (event) => {
        console.log(this.props.activeProperty)
        const name = event.target.name
        const value = event.target.value
        if (name === "is_new") {           
            this.setState(function(state, props) {
                let property = state.activeProperty
                property.is_new = !state.activeProperty.is_new
                return {
                  property
                }
            })
        }
        else if (name === "seasonal") {
            this.setState(function(state, props) {
                let property = state.activeProperty
                property.seasonal = !state.activeProperty.seasonal
                return {
                  property
                }
            }) 
        }
        else {
            this.setState({ activeProperty: { ...this.state.activeProperty, [name]: value} });
        }
    }

    setShow = (show) => {
        this.setState(prevProps => ({deleteAlert: !prevProps.deleteAlert}))
    }

    render() {
        return (
            <Modal style={{maxHeight: "600px", overflow: "scroll"}} show={this.props.show} onHide={this.props.close}>
                    <Modal.Header>New Property</Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Address</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="address" type="text" placeholder={this.state.activeProperty.address} onChange={this.onChange}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Name</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="cust_name" type="text" placeholder={this.state.activeProperty.cust_name || "name"} onChange={this.onChange}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Phone</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="cust_phone" type="text" placeholder={this.state.activeProperty.cust_phone || "phone"} onChange={this.onChange}/>
                                </Col>
                            </Form.Group>
                            <Row>
                                <Col>
                                    <Form.Group as={Row}>
                                        <Form.Label>Surface Type</Form.Label>
                                        <Form.Control name="surface_type" as="select" value={this.state.activeProperty.surface_type || "select"} onChange={this.onChange}>
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
                                        label="New Property?"
                                        checked = {!!this.state.activeProperty.is_new}
                                        onChange={this.onChange}
                                    />
                                    <Form.Check 
                                        name="seasonal"
                                        type="checkbox"
                                        label="Seasonal?"
                                        checked = {!!this.state.activeProperty.seasonal}
                                        onChange={this.onChange}
                                    />
                                </Col>
                            </Row>
                            <Form.Group>
                                <Form.Label>Notes</Form.Label>
                                    <Form.Control name="notes" as="textarea" rows="3" placeholder={this.state.activeProperty.notes || "notes"} onChange={this.onChange}/>
                            </Form.Group>
                        </Form> 
                    </Modal.Body>
                    <Modal.Footer>
                        <Button disabled={!this.state.activeProperty.address} variant="danger" onClick={() => this.setShow(true)}>{this.state.deleteAlert ? "Cancel" : "DELETE PROPERTY"}</Button>
                        <Button variant="primary" onClick={() => this.props.onSave(this.state.activeProperty)}>Save Changes</Button>
                        <Button variant="secondary" onClick={this.props.close}>Close</Button>
                    </Modal.Footer>
                    <Alert show={this.state.deleteAlert} variant="danger">
                    <Alert.Heading>Delete Property?</Alert.Heading>
                    <p>
                    {this.state.activeProperty.address}
                    </p>
                    <hr />
                    <div className="d-flex justify-content-end">
                    <Button onClick={this.props.onDelete} variant="outline-success">
                        Permanently Delete This Property
                    </Button>
                    </div>
                </Alert>
                </Modal>
        )
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(NewProperty)