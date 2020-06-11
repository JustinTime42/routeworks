import React, { Component } from 'react'
import { Dropdown, DropdownButton } from "react-bootstrap"
import { connect } from 'react-redux'
import { setTractorName } from '../actions'

const mapStateToProps = state => {
    return {
        tractorName: state.setTractorName.tractorName
    }
}

const mapDispatchToProps = (dispatch) => {
    return {    
        onSetTractorName: (event) => dispatch(setTractorName(event))
    }
}

//TODO: Put this in a postgres table, create add/edit/delete functionality to front end. 
const tractors = [
    "Opie #1",
    "Besse #2",
    "Clementine #3",
    "Cutie #4",
    "Nellie #5",
    "Marmalade #6",
    "Maribelle #7",
    "Bambi #9",
    "Stubby",
    "Baby Sands",
    "Whitey",
    "Sweeper"
]

class TractorName extends Component {
    constructor(){
        super()
        this.state = {
            show: false,
            routeName: ""
        }
    }
    render() {
        return (
            <DropdownButton title={this.props.tractorName || "Select Tractor"} onSelect={this.props.onSetTractorName} >        
                {
                    tractors.map((tractor, i) => <Dropdown.Item key={tractor} eventKey={tractor}>{tractor}</Dropdown.Item>)
                }                
            </DropdownButton>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TractorName)