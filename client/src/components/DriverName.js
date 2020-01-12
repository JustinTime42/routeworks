import React, { Component } from "react"
import { connect } from 'react-redux'
import { Form, Button } from 'react-bootstrap'
import { setDriverName } from '../actions'

const mapStateToProps = state => {
    return {
        driverName: state.setDriverName.driverName
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onSetDriverName: (name) => dispatch(setDriverName(name))
    }
}

class DriverName extends Component {
    constructor() {
        super()
        this.state = {
            driverName: ''
        }
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
                <Form.Control type="text" placeholder="Driver Name" onChange={this.onChangeDriverName} />
                <Button variant="primary" onClick={this.onSaveDriverName}>Set</Button>
            </div>        
        )
    } 
}

export default connect(mapStateToProps, mapDispatchToProps)(DriverName)   