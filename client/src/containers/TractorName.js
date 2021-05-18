import React, { useEffect, useState, useContext, useCallback } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { Dropdown, DropdownButton, Button, FormControl } from "react-bootstrap"
import { setTractorName, getTractors, deleteTractor, sendNewTractor } from '../actions'
import Can from "../auth/Can"
import { AuthConsumer } from "../authContext"
import {SocketContext, socket} from '../socket'

const TractorName = () => {
    const [showEdit, setShowEdit] = useState(false)
    const [tractor_name, editTractorName] = useState("")
    const tractorName = useSelector(state => state.setTractorName.tractorName)
    const allTractors = useSelector(state => state.getTractors.allTractors)
    const dispatch = useDispatch()
    const socket = useContext(SocketContext);

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

    const toggleEdit = () => setShowEdit(!showEdit)
    const onChangeText = (event) => editTractorName(event.target.value)

    const onSaveNew = () => {        
        //socket.emit('add-tractor', {"tractor_name": tractor_name})
        dispatch(sendNewTractor(tractor_name, allTractors))
        setTractorName("")
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
        <DropdownButton size="sm" title={tractorName || "Select Tractor"} onSelect={onSetTractorName} > 
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