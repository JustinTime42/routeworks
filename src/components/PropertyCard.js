import React, {useState, useEffect} from "react"
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Col, Row, Dropdown, Form } from 'react-bootstrap'
import { serviceLevels } from '../globals.js'
// import { changeActiveProperty } from "./utils.js";
import ButtonWithLoading from "./buttons/ButtonWithLoading.js";
import AsyncActionButton from "./buttons/AsyncActionButton";

const PropertyCard = ({changeActiveProperty, address, activeProperty, width, i, admin, toggleField, setTempRange, detailsClick}) => {
    const navigate = useNavigate()
    const [edittingTemp, setEdittingTemp] = useState(false)
    const [startDate, setStartDate] = useState(address.tempRange?.start ? new Date(address.tempRange.start?.toDate()).toISOString().split('T')[0] : "")
    const [endDate, setEndDate] = useState(address.tempRange?.end ? new Date(address.tempRange.end?.toDate()).toISOString().split('T')[0] : "")
    
    const routeData = useSelector(state => state.setActiveRoute.activeRoute)
    const customers = useSelector(state => state.getAllCustomers.customers)
    const locations = useSelector(state => state.requestAllAddresses.addresses)
    const location = locations.find(location => location.id === address.id)
    const customer = customers.find(customer => customer.id === location?.cust_id)
    
    const status = address.status

    const cardBg = () => {        
        if (address.active === false) return `rgba(231,76,60,.2)`
        else if (address.temp) return `rgba(255,110,0,0.5)`
        else return null
    }

    const cardStyle = {
        margin: '3px',
        padding: '3px',
        borderRadius: "10px",
        border: address?.id === activeProperty?.id ? "7px solid rgb(55,90,127)" : "none",
        width: width,
        backgroundColor: cardBg(), 
        justifyContent:'space-between',
        flexWrap: "nowrap",
    }
    const rightStyle = {
        float: "right", 
        textAlign: "center",
        width: "90px",               
    }

    const statusStyle = {
        textAlign: "center",
        padding: "1px",
        borderRadius: "10px",
        width: "75px",
        backgroundColor: status === "Waiting" ? `rgba(255,200,0,0.9)` : 
            status === "Skipped" ? `rgba(255,0,0,0.7)` :
            status === "Done" ? `rgba(0,255,0,0.7)` : 'rgba(255, 255, 255,0.1)'
    }

    const activeStyle = {
        textAlign: "center",
        borderRadius: "10px",
        width: "75px",
        backgroundColor: cardBg(),
    }

    const editStyle = {
        verticalAlign: "bottom"
    }

    const ServiceLevel = () => {
        const dotStyle = {
            height: '20px',
            width: '20px',
            borderRadius: '50%',
        }
        const priorityStyle = {
            height: '20px',
            borderRadius: '5px',
        }
        let visual = []
        let level = address.service_level
        let levelText = '' 
        if (address.priority) {
            visual.push(<div key="a" style={{...priorityStyle, backgroundColor:`rgba(0,255,0,0.7)`}}>PRIORITY</div>)            
        } 
        else if (address.service_level) {
            levelText = serviceLevels[address.service_level]
            // for (let i = 1; i < 5; i++) {
            //     if (i <= level) {
            //         visual.push(<div key={i} style={{...dotStyle, backgroundColor:`rgba(0,255,0,0.7)`}}>{" "}</div>)
            //     } else {
            //         visual.push(<div key={i} style={{...dotStyle, backgroundColor:`rgba(0,0,0,0.7)`}}>{" "}</div>)
            //     }
            // }
        }  
        if (address.temporary) {
            visual.push(<div key="b" style={{...priorityStyle, backgroundColor:`rgba(0,255,0,0.7)`}}>Temp</div>)            
        }
        if (address.new) {
            visual.push(<div key="c" style={{...priorityStyle, backgroundColor:`rgba(0,255,0,0.7)`}}>New</div>)            
        }
        return (
            <>
                <Col><h4>{levelText}</h4>{visual}</Col>        
            </>
        )
    }

    return (
        <Row 
            id={`card${(typeof(i) === 'number') ? i : address.id}`} 
            style={cardStyle} 
            onClick={() => navigate(changeActiveProperty(address, '', routeData.customers))}>
            <Col style={{flex:"2 1 auto"}}>
                <h5 style={{textAlign: "left", fontWeight: "bold"}}>  
                    {typeof(i) === 'number'  ? i + 1 + '. ' : ''}
                    { location?.showLocName ? `${location?.loc_name}` : customer?.cust_name || "name" }
                    {address ? address.is_new ? "*" : null : null}            
                </h5> 
                <p>{location?.service_address || "address"} </p>                                  
            </Col>
            <ServiceLevel />
            <Col style={{flex:"1 1 75px"}}>                        
                <>                
                    <p style={{...statusStyle, ...rightStyle}}>{status}</p>   
                        {admin ?
                        <Dropdown size="sm" title="Edit" autoClose={!edittingTemp} >
                            <Dropdown.Toggle size="sm">edit</Dropdown.Toggle>
                            <Dropdown.Menu>
                            {admin && toggleField ?
                            <>                            
                            <Dropdown.Item>
                                <Button onClick={() => toggleField(address, routeData, 'active')}>Active</Button>  
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button onClick={() => toggleField(address, routeData, 'priority')}>Priority</Button> 
                            </Dropdown.Item>
                            <Dropdown.Item 
                                onFocus={() => setEdittingTemp(true)} 
                                onBlur={() => setEdittingTemp(false)}
                                >
                                <Button onClick={() => toggleField(address, routeData, 'temporary')}>Temp</Button>
                            </Dropdown.Item>
                            {address.temporary &&
                                <div>
                                    <Form.Label>Start Date:</Form.Label>
                                    <Form.Control 
                                        name="startDate" 
                                        type="date" 
                                        value={startDate}
                                        onChange={event => setStartDate(event.target.value)}
                                    /> 
                                    <Form.Label>End Date:</Form.Label>
                                    <Form.Control 
                                        name="endDate" 
                                        type="date" 
                                        value={endDate}
                                        onChange={event => setEndDate(event.target.value)}
                                    /> 
                                    <AsyncActionButton
                                        style={{marginLeft: "1em", marginTop:"1px"}}
                                        asyncAction={() => setTempRange(address, routeData, startDate, endDate)}
                                        buttonText="Save"
                                        tooltip="Save date range for temporary service."
                                        label='Save'
                                    />

                                    {/* <ButtonWithLoading
                                        handleClick={() => setTempRange(address, routeData, startDate, endDate)}
                                        buttonText="Save"
                                        tooltip="Save date range for temporary service."
                                    /> */}
                                    <Dropdown.Divider />
                                    {/* {console.log(props.address.tempRange)} */}
                                </div>
                            }   
                            
                            <Dropdown.Item>
                                <Button onClick={() => toggleField(address, routeData, 'new')}>New</Button> 
                            </Dropdown.Item>
                            </> : null}                            
                                <Dropdown.Item>
                                    <Button variant="secondary" onClick={(e) => {
                                        e.stopPropagation()
                                        e.preventDefault()
                                        detailsClick(address)
                                    }}>Details</Button>
                                </Dropdown.Item> 
                            </Dropdown.Menu>
                    </Dropdown> : null }
                </> 
            </Col>      
        </Row>
    )
}

export default PropertyCard