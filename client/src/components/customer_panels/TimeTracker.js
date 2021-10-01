import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'

let interval

const TimeTracker = props => {
    const [timeElapsed, setTimeElapsed] = useState(0)
    const [startTime, setStartTime] = useState()
    
    useEffect(() => {        
        if(props.isRunning && (timeElapsed === 0)){            
            interval = setInterval(() => setTimeElapsed(Date.now() - startTime), 500)
        } else if (props.isRunning) {
            setTimeElapsed(Date.now() - startTime)
        }
    },[props.isRunning])

    const DisplayTime = () => {
        let hours = Math.floor(timeElapsed / 3600000).toString().padStart(2,'0')
        let minutes = (Math.floor(timeElapsed / 60000) % 60).toString().padStart(2,'0')
        let seconds = (Math.floor(timeElapsed / 1000) % 60).toString().padStart(2,'0')
        return <h3>{hours}:{minutes}:{seconds}</h3>
    }

    const onStartPress = () => {
            setTimeElapsed(0)
            setStartTime(Date.now())
            props.setIsRunning(true)
    }

    const onStopPress = () => {
        clearInterval(interval) 
        props.setIsRunning(false)
        props.onStatusChange('Waiting', '', new Date(startTime), new Date(Date.now()), false)
    }

    return (
        <Row className='buttonRowStyle' style={{ width:"70%", marginRight:'auto', marginLeft:'auto'}}>
        <h4>Log Time</h4>
        <Form.Label>{startTime ? (new Date(startTime)).toLocaleTimeString() : null}</Form.Label>
        <Button disabled={props.isRunning} size='lg' onClick={onStartPress}>Start</Button>
        <DisplayTime />
        <Button disabled={!props.isRunning} size='lg' onClick={onStopPress}>Stop</Button>                                    
    </Row>

    )
}

export default TimeTracker