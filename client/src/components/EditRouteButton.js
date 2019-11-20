import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import Can from '../components/Can'
import { AuthConsumer } from "../authContext"
import { connect } from "react-redux"
import {showRouteEditor} from "../actions"

const mapStateToProps = state => {
    return {
        showEditor: state.showRouteEditor.showEditor
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onShowEditor: (show) => dispatch(showRouteEditor(show))
    }
}

class EditRouteButton extends Component {
    handleClick = () => {
        this.props.showEditor ? this.props.onShowEditor(false) : this.props.onShowEditor(true)
    }

    render() {
        return (
            <Button variant="primary" onClick={this.handleClick}>
                {this.props.showEditor ? "Show Route" : "Show Editor"}
            </Button>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditRouteButton)
