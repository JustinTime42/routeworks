import React, { Component } from 'react'
import { Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap'
import { connect } from 'react-redux'
import { requestAllAddresses, getRouteProperties } from '../actions'

import '../styles/driver.css'

const mapStateToProps = state => {
    return {         
        activeProperty: state.setActiveProperty.activeProperty,
        activeRoute: state.setActiveRoute.activeRoute,
    }
}

const contractTypes = ["per occurrence", "monthly", "seasonal", "5030"]

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
            deleteAlert: false,
            allTags: []
        }
    }

    getTags = () => {
        fetch(`${process.env.REACT_APP_API_URL}/alltags`)
        .then(res => res.json())
        .then(tags => {
            console.log(tags)
            this.setState({allTags: tags}, console.log(this.state.allTags))
        })
        .catch(err => console.log(err))
    }

    componentDidUpdate(prevProps) {
        if(prevProps.activeProperty !== this.props.activeProperty){
            console.log("component updates")    
            this.getTags()        
            this.setState(
                { activeProperty: {...this.props.activeProperty}, api: this.props.activeProperty ? "editproperty" : "newproperty" },
                console.log(this.props.activeProperty))
        }
      }

    tagChange = (event) => {
        let {target: {name, value} } = event
        console.log(name, value)
        let tagsArray = this.state.activeProperty.tags?.split(',') 
        console.log('tagsArray', tagsArray)
        if (tagsArray.includes(name)) {
            tagsArray.splice(tagsArray.indexOf(name), 1)
            console.log('need to remove')
        } else {
            tagsArray.push(name)
            console.log(tagsArray, 'need to add')
        }
        let tags = tagsArray.join()
        console.log(tags)
        this.setState(prevState => (
            {activeProperty: {...prevState.activeProperty, tags: tags}}
        ), console.log(this.state.activeProperty) )
        

    }

    onChange = (event) => {    
        console.log(this.state.allTags)
        let { target: { name, value } } = event
        let numberValues = ['price', 'value', 'price_per_yard']

        if (numberValues.includes(name)){
            value = Number(value)
        }

        if (value === "on") {           
            this.setState(prevState => (
                {activeProperty: {...prevState.activeProperty, [name]: !prevState.activeProperty[name]}}             
            ))
        }
        else {
            this.setState(prevState => (
                { activeProperty: {...prevState.activeProperty, [name]: value}}
            ))  
        }
    }

    setShow = (show) => {
        this.setState(prevProps => ({deleteAlert: !prevProps.deleteAlert}))
    }

    render() {
        return (
            <Modal className="scrollable" show={this.props.show} onHide={this.props.close} size='lg'>
                    <Modal.Header>Property Editor</Modal.Header>
                    <Modal.Body>
                        <Form>                            
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
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Email</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="cust_email" type="text" placeholder={this.state.activeProperty.cust_email || "email"} onChange={this.onChange}/>
                                </Col>
                            </Form.Group>
                            <Row>
                            <Col>
                                <Form.Label>Job Location</Form.Label>                  
                                <Form.Group as={Row}>
                                    <Form.Label>Address</Form.Label>
                                    <Col>
                                        <Form.Control name="address" type="text" placeholder={this.state.activeProperty.address} onChange={this.onChange}/>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                    <Form.Label>City</Form.Label>
                                    <Col>
                                        <Form.Control name="city" type="text" placeholder={this.state.activeProperty.city} onChange={this.onChange}/>
                                    </Col>
                                </Form.Group>
                                <Row>
                                <Col>
                                <Form.Group>                                                                                                    
                                    <Form.Label>State</Form.Label>   
                                    <Form.Control name="state" type="text" placeholder={this.state.activeProperty.state} onChange={this.onChange}/>
                                </Form.Group>
                                </Col>
                                <Col>
                                <Form.Group>
                                    <Form.Label>Zip</Form.Label>                              
                                    <Form.Control name="zip" type="text" placeholder={this.state.activeProperty.zip} onChange={this.onChange}/> 
                                </Form.Group>
                                </Col>   
                                </Row>                                
                            </Col>
                            <Col>
                                <Form.Label>Billing Address</Form.Label>                  
                                <Form.Group as={Row}>
                                    <Form.Label>Address</Form.Label>
                                    <Col>
                                        <Form.Control name="bill_address" type="text" placeholder={this.state.activeProperty.bill_address} onChange={this.onChange}/>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                    <Form.Label>City</Form.Label>
                                    <Col>
                                        <Form.Control name="bill_city" type="text" placeholder={this.state.activeProperty.bill_city} onChange={this.onChange}/>
                                    </Col>
                                </Form.Group>
                                <Row>                                
                                <Col>
                                <Form.Group>                                                                                                    
                                    <Form.Label>State</Form.Label>   
                                    <Form.Control name="bill_state" type="text" placeholder={this.state.activeProperty.bill_state} onChange={this.onChange}/>
                                </Form.Group>
                                </Col>
                                <Col>
                                <Form.Group>
                                    <Form.Label>Zip</Form.Label>                              
                                    <Form.Control name="bill_zip" type="text" placeholder={this.state.activeProperty.bill_zip} onChange={this.onChange}/> 
                                </Form.Group>
                                </Col>   
                                </Row>
                            </Col>
                            </Row>                 
                            <Row>
                                <Col>
                                    <Form.Group as={Row}>                                        
                                        <Form.Label>Price</Form.Label>
                                        <Form.Control name="price" type="number" placeholder={this.state.activeProperty.price || "price"} onChange={this.onChange}/>
                                        <Form.Label>Sweeping Price</Form.Label>
                                        <Form.Control name="sweep_price" type="number" placeholder={this.state.activeProperty.sweep_price || "sweep_price"} onChange={this.onChange}/>
                                        <Form.Label>Sanding Price Per Yard</Form.Label>
                                        <Form.Control name="price_per_yard" type="number" placeholder={this.state.activeProperty.price_per_yard || "price per yard"} onChange={this.onChange}/>
                                        <Form.Label>Value</Form.Label>
                                        <Form.Control name="value" type="number" placeholder={this.state.activeProperty.value || "value"} onChange={this.onChange}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    
                                    
                                    <Form.Label>Surface Type</Form.Label>
                                    <Form.Control name="surface_type" as="select" value={this.state.activeProperty.surface_type || "select"} onChange={this.onChange}>
                                        <option value="select">Select</option>
                                        <option value="paved">Paved</option>
                                        <option value="gravel">Gravel</option>
                                        <option value="partial">Partial</option>
                                    </Form.Control>
                                    <Form.Label>Contract Type</Form.Label>
                                    <Form.Control name="contract_type" as="select" value={this.state.activeProperty.contract_type || "select"} onChange={this.onChange}>
                                        {
                                            contractTypes.map(type => <option key={type} value={type}>{type}</option>)
                                        }
                                    </Form.Control>
                                    <Row>
                                        <Col>
                                            <Form.Check
                                                name="is_new"
                                                type="checkbox"
                                                label="New?"
                                                checked = {!!this.state.activeProperty.is_new}
                                                onChange={this.onChange}
                                            />   
                                            <Form.Check 
                                                name="inactive"
                                                type="checkbox"
                                                label="Inactive?"
                                                checked = {!!this.state.activeProperty.inactive}
                                                onChange={this.onChange}
                                            />
                                            <Form.Check
                                                name="temp"
                                                type="checkbox"
                                                label="Temporary?"
                                                checked = {!!this.state.activeProperty.temp}
                                                onChange={this.onChange}
                                            />
                                        </Col>
                                        <Col>
                                            <Form.Label>Tags</Form.Label>  
                                            <div  style={{'height':'80px', 'overflow':'auto'}}>
                                            {
                                                this.state.allTags.map(tag => {
                                                    return(                                                        
                                                        <Form.Check 
                                                            key={tag.tag_name}                                                           
                                                            name={tag.tag_name}
                                                            type="checkbox"
                                                            label={tag.tag_name}
                                                            checked = {this.state.activeProperty.tags?.includes(tag.tag_name)}
                                                            onChange={this.tagChange}
                                                        />                                                     
                                                    )                                                
                                                })
                                            }
                                            </div>
                                        </Col>
                                    </Row>                                  
                                    
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