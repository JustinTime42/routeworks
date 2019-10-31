import React, { Component } from "react"
import Can from "../components/Can"
import { AuthConsumer } from "../authContext"
import { connect } from "react-redux"
import Card from "react-bootstrap/Card"
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


import { requestAllAddresses } from "../actions"

const mapStateToProps = state => {
    return {
        addresses: state.requestAllAddresses.addresses,
        // add selectedAddresses
        isPending: state.requestAllAddresses.isPending,
        error: state.requestAllAddresses.error    
    }
}

const mapDispatchToProps = (dispatch) => {
    return {    
        onGetAllAddresses: () => dispatch(requestAllAddresses()) 
    }
}

const renderAddress = (address) => {
    return(
        <Card>
            <Card.Body>
                <Card.Text>{address.address}</Card.Text>
                <Card.Text>{address.cust_name}</Card.Text>
            </Card.Body>
        </Card>
    )
}

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? 'lightgreen' : 'grey',

    // styles we need to apply on draggables
    ...draggableStyle
});

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'lightblue' : 'lightgrey',
    padding: grid,
    width: 250
});

class AddressList extends Component {


    componentDidMount() {
        this.props.onGetAllAddresses()
    }

render() {
    const {addresses, isPending, error } = this.props

    return isPending ?
    <h1> loading </h1> : 
    (
        <div>
            {
                addresses.map(address => renderAddress(address))
            }
          
           
        </div>
    )
}

}

export default connect(mapStateToProps, mapDispatchToProps)(AddressList)
