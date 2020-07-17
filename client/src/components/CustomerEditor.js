import React, { Component } from 'react'
import { Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap'
import { connect } from 'react-redux'
import { requestAllAddresses, getRouteProperties } from '../actions'
import axios from "axios"
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
            allTags: [],
            newTagName: '',
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.activeProperty !== this.props.activeProperty){
            console.log("component updates")
            this.setState(
                { activeProperty: {...this.props.activeProperty}, api: this.props.activeProperty ? "editproperty" : "newproperty" },
                console.log(this.props.activeProperty))
        }
        if(prevProps.show !== this.props.show) {
            if (this.props.show) {this.getTags()}
        }
      }

    componentDidMount() {
        if(this.props.show) {
        this.getTags()
        }        
    }

    getTags = () => {
        fetch(`${process.env.REACT_APP_API_URL}/alltags`)
        .then(res => res.json())
        .then(tags => {
            this.setState({allTags: tags})
        }) 
        .catch(err => console.log(err))
    }

    tagChange = (event) => {
        let {target: {name, value} } = event
        let tagsArray = this.state.activeProperty.tags ? this.state.activeProperty.tags?.split(',') : []
        if (tagsArray.includes(name)) {
            tagsArray.splice(tagsArray.indexOf(name), 1)
        } else {
            tagsArray.push(name)
        }
        let tags = tagsArray.join()
        this.setState(prevState => ({activeProperty: {...prevState.activeProperty, tags: tags}}))  
    }

    saveNewTag = () => {     
        axios.post(`${process.env.REACT_APP_API_URL}/newtag`, { tag_name: this.state.newTagName})
        .then(tag => this.setState(prevState => ({allTags: [...prevState.allTags, tag.data]}))) 
        .catch(err => console.log(err))
    }

    deleteTag = (tag) => {
        axios.post(`${process.env.REACT_APP_API_URL}/deltag`, { tag_name: tag})
        .then(tag => {
            this.setState(prevState =>{
                let newArray = [...prevState.allTags.splice(prevState.allTags.indexOf(tag.data[0].tag_name), 1)]
                return(newArray)           
            })
        })
        .catch(err => console.log(err))
    }
    
    onChange = (event) => {
        let { target: { name, value } } = event
        console.log(name, value)
        let numberValues = ['price', 'value', 'price_per_yard', 'sweep_price']
        if (numberValues.includes(name)){
            value = Number(value)
        }
        if (value === "on") {           
            this.setState(prevState => (
                {activeProperty: {...prevState.activeProperty, [name]: !prevState.activeProperty[name]}}             
            ))
        } else if (name === 'newTagName') {
            this.setState({newTagName: value})
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
                    <Modal.Header>Customer Editor</Modal.Header>
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
                            <Form.Row> 
                            <Col> 
                            <Form.Label size='sm'>Prices</Form.Label>
                                <Form.Group>
                                    <Form.Row>  
                                        <Col xs={8}>
                                            <Form.Label size='sm'>Price</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control size='sm' name="price" type="number" placeholder={this.state.activeProperty.price || "price"} onChange={this.onChange}/>
                                        </Col>
                                    </Form.Row>                                    
                                </Form.Group>
                                <Form.Group>
                                <Form.Row>
                                    <Col xs={8}>
                                        <Form.Label size='sm'>Sweeping Price</Form.Label>
                                    </Col>                                    
                                    <Col>
                                        <Form.Control size='sm' name="sweep_price" type="number" placeholder={this.state.activeProperty.sweep_price || "sweeping price"} onChange={this.onChange}/>
                                    </Col>
                                </Form.Row>
                                </Form.Group>
                                <Form.Group>
                                <Form.Row>
                                    <Col xs={8}>
                                        <Form.Label size='sm'>Sanding Price Per Yard</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control size='sm' name="price_per_yard" type="number" placeholder={this.state.activeProperty.price_per_yard || "price per yard"} onChange={this.onChange}/>
                                    </Col>
                                </Form.Row>
                                </Form.Group>
                                <Form.Group>
                                <Form.Row>
                                    <Col xs={8}>
                                    <Form.Label size='sm'>Value</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control size='sm' name="value" type="number" placeholder={this.state.activeProperty.value || "value"} onChange={this.onChange}/>
                                    </Col>
                                </Form.Row>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label size='sm'>Surface Type</Form.Label>
                                        <Form.Control size='sm' name="surface_type" as="select" value={this.state.activeProperty.surface_type || "select"} onChange={this.onChange}>
                                            <option value="select">Select</option>
                                            <option value="paved">Paved</option>
                                            <option value="gravel">Gravel</option>
                                            <option value="partial">Partial</option>
                                        </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Contract Type</Form.Label>
                                        <Form.Control name="contract_type" as="select" value={this.state.activeProperty.contract_type || "select"} onChange={this.onChange}>
                                            {
                                                contractTypes.map(type => <option key={type} value={type}>{type}</option>)
                                            }
                                        </Form.Control>
                                </Form.Group>
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
                                <Form.Row style={{marginBottom: '1em'}}>
                                    <Col>
                                        <Button size='sm' variant='primary' onClick={this.saveNewTag}>add tag</Button>
                                    </Col>
                                    <Col>
                                        <Form.Control name="newTagName" type="text" placeholder={this.state.newTagName} onChange={this.onChange}/>
                                    </Col>
                                </Form.Row>
                                {                                    
                                    this.state.allTags.map((tag, i) => {
                                        return(       
                                            <Form.Row key={i}>
                                                <Col xs={7}>
                                                    <Form.Check                                                          
                                                        name={tag}
                                                        type="checkbox"
                                                        label={tag}
                                                        checked = {this.state.activeProperty.tags?.includes(tag) || false}
                                                        onChange={this.tagChange}
                                                    />  
                                                </Col>
                                                <Col style={{textAlign: "right"}}>
                                                    <Button style={{marginLeft: "1em"}} size='sm' variant='primary' onClick={() => this.deleteTag(tag)}>delete</Button>

                                                </Col>
                                                
                                            </Form.Row>                                                 
                                                                                               
                                        )                               
                                    })
                                }
                            </Col>
                            </Form.Row>
                            <Form.Group>
                                <Form.Label>Notes</Form.Label>
                                    <Form.Control name="notes" as="textarea" rows="3" placeholder={this.state.activeProperty.notes || "notes"} onChange={this.onChange}/>
                            </Form.Group>
                        </Form> 
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={() => this.setShow(true)}>{this.state.deleteAlert ? "Cancel" : "DELETE PROPERTY"}</Button>
                        <Button variant="primary" onClick={() => this.props.onSave(this.state.activeProperty)}>Save Customer</Button>
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