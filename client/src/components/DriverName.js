import React, { Component } from "react"
import axios from "axios"
import { connect } from 'react-redux'
import { Dropdown, DropdownButton, Button, Modal } from 'react-bootstrap'
import { setActiveDriver, getDrivers } from '../actions'
import Can from "../components/Can"
import { AuthConsumer } from "../authContext"


// fetching drivers and selecting I think work now
// next do edit driver and delete driver
//after that, most of that code can be reused for the tractor selector for add/edit/delete 

const mapStateToProps = state => {
    return {
        driverName: state.setActiveDriver.driver,
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
            driverName: '',
            percentage: '',
            show: false
        }
    }

    componentDidMount() {
        this.props.onGetDrivers()
    }

    onSetActiveDriver = (event) => {
        if (event === "New Driver") {
            console.log("New Driver")
            return
        } else {
            this.props.onSetActiveDriver(this.props.drivers.find(driver => driver.key === parseInt(event)))
        }
    }
    onSetDriverName = (event) => this.setState({driverName: event.target.value}) 
    onSetDriverPercentage = (event) => this.setState({percentage: event.target.value})
    handleClose = () => this.setState({show: false})
    handleShow = () => this.setState({show: true})

    saveNewDriver = () => {
        axios.post(`https://snowline-route-manager.herokuapp.com/api/newDriver`, { name: this.state.driverName, percentage: this.state.percentage })
        .then(res => {
          console.log(res)
          this.props.onGetDrivers()
        })
        .catch(err => console.log(err)) 
        this.handleClose()
    }
    onChangeDriverName = (event) => {
        this.setState({driverName: event.target.value})
    }

    onSaveDriverName = () => {
        this.props.onSetDriverName(this.state.driverName)
    }

    render() {
        return (              
            <div style={{display: "flex"}}>
                <DropdownButton title={this.props.driverName.name || "Select Driver"} onSelect={this.onSetActiveDriver} >  
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
                    this.props.drivers.map((driver, i) => <Dropdown.Item key={driver.key} eventKey={driver.key}>{driver.name}</Dropdown.Item>)
                      
                }
                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header>Enter New Driver</Modal.Header>
                    <Modal.Body>
                        <form>
                            <input onChange={this.onSetDriverName} type="text" name="driverName" placeholder="Driver Name"></input>
                            <input onChange={this.onSetDriverPercentage} type="text" name="percentage" placeholder="percentage"></input>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                        Close
                        </Button>
                        <Button variant="primary" onClick={this.saveNewDriver}>
                        Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
                
            </DropdownButton>
                
            </div>  
        )
    } 
}

export default connect(mapStateToProps, mapDispatchToProps)(DriverName)   