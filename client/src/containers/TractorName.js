import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { Dropdown, DropdownButton, Button, FormControl, Row, Col } from "react-bootstrap"
import DropdownItem from 'react-bootstrap/DropdownItem'
import { setTractorName, getTractors, getNewTractor, deleteTractor, sendNewTractor } from '../actions'
import Can from "../auth/Can"
import { AuthConsumer } from "../authContext"
import { io } from 'socket.io-client';
const socket = io('https://snowline-route-manager.herokuapp.com/')


// const mapDispatchToProps = (dispatch) => {
//     return {    
//         onSetTractorName: (event) => dispatch(setTractorName(event)),
//         onGetTractors: () => dispatch(getTractors()),
//         onAddTractor: (tractor, allTractors) => dispatch(addTractor(tractor, allTractors)),
//         onDeleteTractor: (tractor, allTractors) => dispatch(deleteTractor(tractor, allTractors)),
//     }
// }

const TractorName = () => {
    const [showEdit, setShowEdit] = useState(false)
    const [tractor_name, editTractorName] = useState("")
    const tractorName = useSelector(state => state.setTractorName.tractorName)
    const allTractors = useSelector(state => state.getTractors.allTractors)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getTractors())
    }, [])

    // useEffect(() => {
    //     console.log("updating tractor list")
    //     socket.on('newTractor', newTractor => {
    //         console.log("new tractor: ", newTractor)
    //         allTractors.push(newTractor[0])
    //         dispatch({ type: 'GET_TRACTORS_SUCCESS', payload: allTractors})
    //         dispatch(getNewTractor(newTractor[0], allTractors))
    //     })
    // })

    // componentDidMount() {
    //     this.props.onGetTractors()
    // }

    // componentDidUpdate(prevProps) {
    //     if(this.props.allTractors !== prevProps.allTractors) {
    //         //this.props.onGetTractors()
    //     } 
    // }

    const toggleEdit = () => setShowEdit(!showEdit)
    const onChangeText = (event) => editTractorName(event.target.value)

    const onSaveNew = () => {        
        //socket.emit('add-tractor', {"tractor_name": tractor_name})
        dispatch(sendNewTractor(tractor_name, allTractors))
        setTractorName("")
        //dispatch(getTractors())
    } 
    const onDelete = (tractor, allTractors) => {
        dispatch(deleteTractor(tractor, allTractors))
        setTractorName("")
        dispatch(getTractors())
        dispatch(setTractorName(''))
    }

    const onSetTractorName = (tractorName) => {
        dispatch(setTractorName(tractorName))
    }

    return (
        <DropdownButton title={tractorName || "Select Tractor"} onSelect={onSetTractorName} > 
            <AuthConsumer>
            {({ user }) => (
                <Can
                    role={user.role}
                    perform="admin:visit"
                    yes={() => (
                        <div><Button variant="primary" size="sm" onClick={toggleEdit}>{showEdit ? "Close" : "Edit"}</Button></div>                    
                    )}
                    no={() => null}               
                />                            
            )}
        </AuthConsumer> 
        {
            allTractors.map((tractor, i) => {
                return (
                    <div key={i} style={{display: "flex"}}>
                        <Dropdown.Item eventKey={tractor.tractor_name}>{tractor.tractor_name}</Dropdown.Item>  
                        <Button style={{visibility: showEdit ? "initial" : "hidden", }} onClick={() => onDelete(tractor.tractor_name, allTractors)}>delete</Button>
                    </div>
                )
            })
        }   
        <div style={{visibility: showEdit ? "initial" : "hidden", display: "flex"}}>
            <FormControl size="sm" type="text" onChange={onChangeText} placeholder="new tractor" value={tractor_name} />
            <Button size="sm" onClick={onSaveNew}>Save</Button>                
        </div>             
        </DropdownButton>
    )
    
}

export default TractorName