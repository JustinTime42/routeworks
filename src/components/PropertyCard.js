import React from "react"
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Col, Row, Dropdown, DropdownButton } from 'react-bootstrap'
import { serviceLevels } from '../globals.js'
import { changeActiveProperty } from "./utils.js";


const PropertyCard = (props) => {
    const navigate = useNavigate()
    const routeData = useSelector(state => state.setActiveRoute.activeRoute)
    const status = props.address.status

    const cardBg = () => {        
        if (props.address.active === false) return `rgba(231,76,60,.2)`
        else if (props.address.temp) return `rgba(255,110,0,0.5)`
        else return null
    }

    const cardStyle = {
        margin: '3px',
        padding: '3px',
        borderRadius: "10px",
        border: props.address?.id === props.activeProperty?.id ? "7px solid rgb(55,90,127)" : "none",
        width: props.width,
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
        let level = props.address.service_level
        let levelText = '' 
        if (props.address.priority) {
            visual.push(<div key="a" style={{...priorityStyle, backgroundColor:`rgba(0,255,0,0.7)`}}>PRIORITY</div>)            
        } 
        else if (props.address.service_level) {
            levelText = serviceLevels[props.address.service_level]
            // for (let i = 1; i < 5; i++) {
            //     if (i <= level) {
            //         visual.push(<div key={i} style={{...dotStyle, backgroundColor:`rgba(0,255,0,0.7)`}}>{" "}</div>)
            //     } else {
            //         visual.push(<div key={i} style={{...dotStyle, backgroundColor:`rgba(0,0,0,0.7)`}}>{" "}</div>)
            //     }
            // }
        }  
        if (props.address.temporary) {
            visual.push(<div key="b" style={{...priorityStyle, backgroundColor:`rgba(0,255,0,0.7)`}}>Temp</div>)            
        }
        if (props.address.new) {
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
            id={`card${(typeof(props.i) === 'number') ? props.i : props.address.id}`} 
            style={cardStyle} 
            onClick={() => navigate(changeActiveProperty(props.address, '', routeData.customers))}>
            <Col style={{flex:"2 1 auto"}}>
                <h5 style={{textAlign: "left", fontWeight: "bold"}}>  
                    {typeof(props.i) === 'number'  ? props.i + 1 + '. ' : ''}
                    {props.address ? props.address.cust_name ? props.address.cust_name : "name" : "name"}
                    {props.address ? props.address.is_new ? "*" : null : null}            
                </h5> 
                <p>{props.address ? props.address.service_address ? props.address.service_address : "address" : "address"} </p>                   
            </Col>
            <ServiceLevel />
            <Col style={{flex:"1 1 75px"}}>             
                <>
                    <p style={{...statusStyle, ...rightStyle}}>{status}</p>   
                        {props.admin ? 
                        <DropdownButton size="sm" title="Edit">
                            {props.admin && props.toggleField ?
                            <>
                            <Dropdown.Item>
                                <Button onClick={() => props.toggleField(props.address, routeData, 'active')}>Active</Button>  
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button onClick={() => props.toggleField(props.address, routeData, 'priority')}>Priority</Button> 
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button onClick={() => props.toggleField(props.address, routeData, 'temporary')}>Temp</Button> 
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button onClick={() => props.toggleField(props.address, routeData, 'new')}>New</Button> 
                            </Dropdown.Item>
                            </> : null}                            
                                <Dropdown.Item>
                                    <Button variant="secondary" onClick={() => props.detailsClick(props.address)}>Details</Button>
                                </Dropdown.Item>                             
                    </DropdownButton> : null }
                </> 
            </Col>      
        </Row>
    )
}

export default PropertyCard