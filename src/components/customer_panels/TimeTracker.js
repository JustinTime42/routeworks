import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Button, Modal, Form, Row, Col, Alert, Container } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import '../../styles/driver.css'

let interval

const TimeTracker = ({needsYards, isRunning, setIsRunning, onStatusChange}) => {
    const [timeElapsed, setTimeElapsed] = useState(0)
    const [startTime, setStartTime] = useState()
    
    useEffect(() => {        
        if(isRunning && (timeElapsed === 0)){    
            console.log('isRunning', isRunning)         
            interval = setInterval(() => setTimeElapsed(Date.now() - startTime), 500)
        } else if (isRunning) {
            setTimeElapsed(Date.now() - startTime)
        } else {
            clearInterval(interval)
            setTimeElapsed(0)
        }
    },[isRunning])

    const DisplayTime = () => {
        let hours = Math.floor(timeElapsed / 3600000).toString().padStart(2,'0')
        let minutes = (Math.floor(timeElapsed / 60000) % 60).toString().padStart(2,'0')
        let seconds = (Math.floor(timeElapsed / 1000) % 60).toString().padStart(2,'0')
        return <h4>{hours}:{minutes}:{seconds}</h4>
    }

    const onStartPress = () => {
        setTimeElapsed(0)
        setStartTime(Date.now())
        setIsRunning(true)
    }

    const onStopPress = () => {
        clearInterval(interval) 
        setIsRunning(false)
        onStatusChange('In Progress', '', new Date(startTime), new Date(Date.now()), false)
    }

    return (
        <Container style={{ width:"90%", marginRight:'auto', marginLeft:'auto'}}>
            <Row>
                <Col><h4>Log Time</h4></Col>
            </Row>
            <Row className='buttonRowStyle' style={{flexWrap:'nowrap'}}>                
                <Col sm={4}><Form.Label><h5>{startTime ? (new Date(startTime)).toLocaleTimeString() : null}</h5></Form.Label></Col>
                <Col><Button disabled={isRunning} size='lg' onClick={onStartPress}>Start</Button></Col>
                <Col><DisplayTime /></Col>
                <Col><Button disabled={!isRunning || needsYards} size='lg' onClick={onStopPress}>Stop</Button></Col>                                    
            </Row>
        </Container>
    )
}

export default TimeTracker