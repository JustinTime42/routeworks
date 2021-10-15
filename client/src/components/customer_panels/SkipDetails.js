import React, { useState, useEffect } from 'react'
import { Alert, Button, DropdownButton, Dropdown, Form } from 'react-bootstrap'

const SkipDetails = (props) => {

    const [skipReason, setSkipReason] = useState('')
    const [snowDepth, setSnowDepth] = useState('')
    const [otherNotes, setOtherNotes] = useState('')
    const snowDepthOptions = () => {
        let options = []
        for (let i = .25; i<=3.5; i+=.25) {
            options.push(`${i} inches`)
        }        
        return options
    } 

    useEffect(() => {
        resetOptions()
    }, [props])

    useEffect(() => {
        setSnowDepth('')
        setOtherNotes('')
    }, [skipReason])

    const resetOptions = () => {
        setSkipReason('')
        setSnowDepth('')
        setOtherNotes('')
    }

    const cancelSkip = () => {
        props.toggleShowSkip()
        resetOptions()
    }

    const confirmSkip = () => {
        props.onStatusChange('Skipped', `Skipped: ${skipReason} ${snowDepth} ${otherNotes}`)
    }

    const isConfirmDisabled = () => {
        if ((skipReason === 'Snow Depth') && (snowDepth)) return false
        else if (skipReason === 'Soft Ground') return false
        else if ((skipReason === 'Other Reason') && (otherNotes)) return false
        else if ((skipReason === 'Customer Request') || skipReason ==='Already Cleared') return false
        else return true
    }

    return (
        <Alert show={props.show} variant="danger">
        <Alert.Heading>Skip {props.customer.address}?</Alert.Heading>
            <div className="d-flex justify-content-around align-items-center">
                <Button size="lg" style={{marginRight:"3px"}} onClick={cancelSkip}>Cancel</Button>
                <Button size="lg" disabled={isConfirmDisabled()} onClick={confirmSkip} variant="primary">Confirm</Button>
                <DropdownButton style={{margin:"1em"}} size="lg" title={skipReason || "Select Reason"} onSelect={setSkipReason}>
                    <Dropdown.Item key="Soft Ground" eventKey="Soft Ground"><h5>Soft Ground</h5></Dropdown.Item>
                    <Dropdown.Item key="Snow Depth" eventKey="Snow Depth"><h5>Not Enough Snow</h5></Dropdown.Item>
                    <Dropdown.Item key="Customer Request" eventKey="Customer Request"><h5>Customer Request</h5></Dropdown.Item>
                    <Dropdown.Item key="Already Cleared" eventKey="Already Cleared"><h5>Already Cleared</h5></Dropdown.Item>
                    <Dropdown.Item key="Other Reason" eventKey="Other Reason"><h5>Other</h5></Dropdown.Item>
                </DropdownButton>
                {
                    skipReason==='Snow Depth' ? 
                    <DropdownButton style={{margin:"1em"}} size="lg"  title={snowDepth || "Depth"} onSelect={(event) => setSnowDepth(event)}>
                    {
                        snowDepthOptions().map(option => (
                            <Dropdown.Item key={option} eventKey={option}><h5>{option}</h5></Dropdown.Item>
                        ))                           
                    }                   
                    </DropdownButton> : null 
                }                            
            </div>
            {
                skipReason==='Other Reason' ? 
                <Form.Control style={{marginLeft:"1em"}} name="otherReason" as="input" type="text" rows="1" value={otherNotes} onChange={(event) => setOtherNotes(event.target.value)}></Form.Control>
                : null                    
            }    
        </Alert>
    )
}

export default SkipDetails