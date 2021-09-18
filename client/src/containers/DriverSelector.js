import React, { Component } from "react"
import axios from "axios"
import { connect } from 'react-redux'
import { Dropdown, DropdownButton, Button, Modal, Alert, Form } from 'react-bootstrap'
import { setActiveDriver, getDrivers } from '../actions'
import Can from "../auth/Can"
import { AuthConsumer } from "../authContext"

const mapStateToProps = state => {
    return {
        activeDriver: state.setActiveDriver.driver,
        drivers: state.getDrivers.drivers,
        isPending: state.getDrivers.isPending,
        error: state.getDrivers.error,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onSetActiveDriver: (driver) => dispatch(setActiveDriver(driver)),
        onGetDrivers: () => dispatch(getDrivers())
    }
}

class DriverName extends Component {
    constructor() {
        super()
        this.state = {
            key: null,
            name: '',
            percentage: 0,
            hourly: 0,
            show: false,
            deleteAlert: false
        }
    }

    componentDidMount() {
        this.props.onGetDrivers()
    }

    componentDidUpdate(prevProps, prevState) {
        if(this.props.isPending !== prevProps.isPending || this.props.activeDriver !== prevProps.activeDriver) {
            console.log("update")
            console.log(!!this.props.activeDriver)
            this.setState({...this.props.activeDriver, deleteAlert: false})
        } 
    }

    onSetActiveDriver = (event) => {
        if (event === "New Driver") {
            this.props.onSetActiveDriver({key: '', name: '', percentage: '', hourly: ''})
        } else {
            this.props.onSetActiveDriver(this.props.drivers.find(driver => driver.key === parseInt(event)))
        }
    }
    onChange = (event) => {
        let {target: {name, value} } = event
        if (name === "percentage" || name === "hourly") {
            value = Number(value)
        }
        this.setState({[name]:value})
    }
    handleClose = () => this.setState({show: false, deleteAlert: false})
    handleShow = () => this.setState({show: true})    
    setShowDelete = (show) => {
        this.setState(prevProps => ({deleteAlert: !prevProps.deleteAlert}))
    }
    saveDriver = () => {
        console.log(this.state)
        const endpoint = this.state.key ? "editDriver" : "newDriver"        
        axios.post(`${process.env.REACT_APP_API_URL}/${endpoint}`, { key: this.state.key, name: this.state.name, percentage: this.state.percentage, hourly: this.state.hourly })
        .then(res => {
            console.log(res)
            this.props.onGetDrivers()
            this.props.onSetActiveDriver({key: '', name: '', percentage: '', hourly: ''})
            this.setState({show: false})
        })
        .catch(err => console.log(err))        
    }

    onDeleteDriver = () => {
        axios.post(`${process.env.REACT_APP_API_URL}/deletedriver`, { key: this.state.key })
        .then(res => {
        console.log(res)
        this.props.onGetDrivers()
        this.props.onSetActiveDriver({
            key: '',
            name: '',
            percentage: '',
            hourly: ''
        })
        })
        .catch(err => console.log(err)) 
        this.setState({deleteAlert: false, show: false})   
    }

    render() {
        return (              
            <div style={{display: "flex"}}>
                <DropdownButton size="sm" title={this.props.activeDriver.name || "Select Driver"} onSelect={this.onSetActiveDriver} >  
                <AuthConsumer>
                    {({ user }) => (
                        <Can
                            role={user.role}
                            perform="admin:visit"
                            yes={() => (
                                <Dropdown.Item eventKey="New Driver"><Button variant="primary" size="sm" onClick={this.handleShow}>Create New Driver</Button></Dropdown.Item>                      
                            )}
                            no={() => null}               
                        />                            
                    )}
                </AuthConsumer>
                {                    
                    this.props.drivers.map((driver, i) => {  
                        return (
                             <div key={i} style={{display: "flex"}}>
                                <Dropdown.Item key={driver.key} eventKey={driver.key}>
                                 {driver.name}
                                 <AuthConsumer key={i}>
                                    {({ user }) => (
                                        <Can
                                            role={user.role}
                                            perform="admin:visit"
                                            yes={() => (
                                                <Button style={{float: "right"}} variant="primary" size="sm" onClick={this.handleShow}>Edit</Button>                      
                                            )}
                                            no={() => null}               
                                        />                            
                                    )}
                                </AuthConsumer>
                                 </Dropdown.Item> 
                             </div>
                        )
                    })           
                    }
                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Body>
                        <Form.Control size="sm" name="name" type="text" onChange={this.onChange} placeholder="Name" value={this.state.name} />
                        <Form.Control size="sm" name="percentage" type="numeric" onChange={this.onChange} placeholder="Percentage" value={this.state.percentage} />
                        <Form.Control size="sm" name="hourly" type="numeric" onChange={this.onChange} placeholder="Hourly" value={this.state.hourly} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button disabled={!this.state.key} variant="danger" onClick={() => this.setShowDelete(true)}>{this.state.deleteAlert ? "CANCEL" : "DELETE DRIVER"}</Button>

                        <Button variant="secondary" onClick={this.handleClose}>
                        Close
                        </Button>
                        <Button variant="primary" onClick={this.saveDriver}>
                        Save Changes
                        </Button>
                    </Modal.Footer>
                    <Alert show={this.state.deleteAlert} variant="danger">
                        <Alert.Heading>Delete Driver?</Alert.Heading>
                        <p>
                        {this.state.name}
                        </p>
                        <hr />
                        <div className="d-flex justify-content-end">
                        <Button onClick={this.onDeleteDriver} variant="outline-success">
                            Delete This Driver
                        </Button>
                        </div>
                    </Alert>
                </Modal>
            </DropdownButton>
            </div>  
        )
    } 
}

export default connect(mapStateToProps, mapDispatchToProps)(DriverName)   