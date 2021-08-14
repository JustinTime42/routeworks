import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'

let interval

const TimeTracker = props => {
    const [timeElapsed, setTimeElapsed] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [startTime, setStartTime] = useState(0)
    
    useEffect(() => {        
        if(isRunning && (timeElapsed === 0)){            
            interval = setInterval(() => setTimeElapsed(Date.now() - startTime), 500)
        } else if (isRunning) {
            setTimeElapsed(Date.now() - startTime)
        }
    },[isRunning])



    const DisplayTime = () => {
        let hours = Math.floor(timeElapsed / 3600000).toString().padStart(2,'0')
        let minutes = Math.floor(timeElapsed / 60000).toString().padStart(2,'0')
        let seconds = (Math.floor(timeElapsed / 1000) % 60).toString().padStart(2,'0')
        return <Form.Label>{hours}:{minutes}:{seconds}</Form.Label>
    }

    const onStartPress = () => {
            setStartTime(Date.now())
            setIsRunning(true)
    }

    const onStopPress = () => {
        clearInterval(interval) 
        setTimeElapsed(0)
        setIsRunning(false)
        props.enableButtons()
        //save time to server
    }

    return (
        <Row className='buttonRowStyle' style={{ width:"70%", marginRight:'auto', marginLeft:'auto'}}>
        <h4>Log Time</h4>
        <Button size='lg' onClick={onStartPress}>Start</Button>
        <DisplayTime />
        <Button size='lg' onClick={onStopPress}>Stop</Button>                                    
    </Row>

    )
}

export default TimeTracker