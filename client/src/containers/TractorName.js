import React, { Component } from 'react'
import { Dropdown, DropdownButton, Button, FormControl, Row, Col } from "react-bootstrap"
import DropdownItem from 'react-bootstrap/DropdownItem'
import { connect } from 'react-redux'
import { setTractorName, getTractors, addTractor, deleteTractor } from '../actions'
import Can from "../auth/Can"
import { AuthConsumer } from "../authContext"

const mapStateToProps = state => {
    return {
        tractorName: state.setTractorName.tractorName,
        allTractors: state.getTractors.allTractors,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {    
        onSetTractorName: (event) => dispatch(setTractorName(event)),
        onGetTractors: () => dispatch(getTractors()),
        onAddTractor: (tractor, allTractors) => dispatch(addTractor(tractor, allTractors)),
        onDeleteTractor: (tractor, allTractors) => dispatch(deleteTractor(tractor, allTractors)),
    }
}

class TractorName extends Component {
    constructor(){
        super()
        this.state = {
            showEdit: false,
            tractor_name: "",
        }
    }

    componentDidMount() {
        this.props.onGetTractors()
    }

    componentDidUpdate(prevProps) {
        if(this.props.allTractors !== prevProps.allTractors) {
            //this.props.onGetTractors()
        } 
    }

    toggleEdit = () => {
        this.setState(prevState => ({showEdit: !prevState.showEdit}))
    }

    onChangeText = (event) => this.setState({tractor_name: event.target.value})
    onSaveNew = () => {
        this.props.onAddTractor(this.state.tractor_name, this.props.allTractors)
        this.setState({tractor_name: ""})
        this.props.onGetTractors()
    } 
    onDelete = (tractor, allTractors) => {
        this.props.onDeleteTractor(tractor, allTractors)
        this.setState({tractor_name: ""})
        this.props.onGetTractors()
        this.props.onSetTractorName('')
    }

    render() {
        return (
            <DropdownButton title={this.props.tractorName || "Select Tractor"} onSelect={this.props.onSetTractorName} > 
                <AuthConsumer>
                {({ user }) => (
                    <Can
                        role={user.role}
                        perform="admin:visit"
                        yes={() => (
                            <div><Button variant="primary" size="sm" onClick={this.toggleEdit}>{this.state.showEdit ? "Close" : "Edit"}</Button></div>                    
                        )}
                        no={() => null}               
                    />                            
                )}
            </AuthConsumer> 
            {
                this.props.allTractors.map((tractor, i) => {
                    return (
                        <div key={i} style={{display: "flex"}}>
                            <Dropdown.Item eventKey={tractor.tractor_name}>{tractor.tractor_name}</Dropdown.Item>  
                            <Button style={{visibility: this.state.showEdit ? "initial" : "hidden", }} onClick={() => this.onDelete(tractor.tractor_name, this.props.allTractors)}>delete</Button>
                        </div>
                    )
                })
            }   
            <div style={{visibility: this.state.showEdit ? "initial" : "hidden", display: "flex"}}>
                <FormControl size="sm" type="text" onChange={this.onChangeText} placeholder="new tractor" value={this.state.tractor_name} />
                <Button size="sm" onClick={this.onSaveNew}>Save</Button>                
            </div>             
            </DropdownButton>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TractorName)