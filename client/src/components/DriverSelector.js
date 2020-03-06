import React, { Component } from "react"
import axios from "axios"
import { connect } from 'react-redux'
import { Dropdown, DropdownButton, Button, Modal, Alert } from 'react-bootstrap'
import { setActiveDriver, getDrivers } from '../actions'
import Can from "./Can"
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
            key: '',
            name: '',
            percentage: '',
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
            this.setState({...this.props.activeDriver})
        } 
    }

    onSetActiveDriver = (event) => {
        if (event === "New Driver") {
            this.props.onSetActiveDriver({key: '', name: '', percentage: ''})
        } else {
            this.props.onSetActiveDriver(this.props.drivers.find(driver => driver.key === parseInt(event)))
        }
    }
    onNameChange = (event) => this.setState({name: event.target.value}) 
    onPercentageChange = (event) => this.setState({percentage: event.target.value})
    handleClose = () => this.setState({show: false})
    handleShow = () => this.setState({show: true})
    setShowDelete = (show) => {
        this.setState(prevProps => ({deleteAlert: !prevProps.deleteAlert}))
    }
    saveDriver = () => {
        const endpoint = this.state.key ? "editDriver" : "newDriver"        
        axios.post(`https://snowline-route-manager.herokuapp.com/api/${endpoint}`, { key: this.state.key, name: this.state.name, percentage: this.state.percentage })
        .then(res => {
        console.log(res)
        this.props.onGetDrivers()
        this.setState({show: false})
        })
        .catch(err => console.log(err))        
    }

    onDeleteDriver = () => {
        axios.post(`https://snowline-route-manager.herokuapp.com/api/deletedriver`, { key: this.state.key })
        .then(res => {
        console.log(res)
        this.props.onGetDrivers()
        this.props.onSetActiveDriver({
            key: '',
            name: '',
            percentage: ''
        })
        })
        .catch(err => console.log(err)) 
        this.setState({deleteAlert: false, show: false})   
    }

    onSaveDriverName = () => {
        this.props.onSetDriverName(this.state.name)
    }

    render() {
        return (              
            <div style={{display: "flex"}}>
                <DropdownButton title={this.props.activeDriver.name || "Select Driver"} onSelect={this.onSetActiveDriver} >  
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
                    this.props.drivers.map((driver, i) => <Dropdown.Item key={driver.key} eventKey={driver.key}>
                        {driver.name}
                        <AuthConsumer>
                            {({ user }) => (
                                <Can
                                    role={user.role}
                                    perform="admin:visit"
                                    yes={() => (
                                        <Button variant="primary" size="sm" onClick={this.handleShow}>Edit</Button>                      
                                    )}
                                    no={() => null}               
                                />                            
                            )}
                        </AuthConsumer>
                        </Dropdown.Item>)           
                }
                <Modal show={this.state.show} onHide={this.handleClose}>
                    
                    <Modal.Body>
                        <form>
                            <input onChange={this.onNameChange} type="text" name="driverName" placeholder="Driver Name" value={this.state.name}></input>
                            <input onChange={this.onPercentageChange} type="text" name="percentage" placeholder="percentage" value={this.state.percentage}></input>
                        </form>
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