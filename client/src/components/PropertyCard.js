import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Row } from 'react-bootstrap'
import { serviceLevels } from '../globals.js'
import { editItem, getRouteData, requestAllAddresses } from "../actions.js";
import { UPDATE_ADDRESSES_SUCCESS, ROUTE_DATA_SUCCESS, ROUTE_DATA_PENDING, GET_ROUTE_PENDING, UPDATE_ADDRESSES_PENDING, SET_ACTIVE_PROPERTY, GET_ROUTE_SUCCESS, GET_ITEMS_FAILED } from '../constants'

const PropertyCard = (props) => {

    const routeData = useSelector(state => state.getRouteData.routeData)
    const customers = useSelector(state => state.requestAllAddresses.addresses)
    const dispatch = useDispatch()

    // useEffect(() => {
    //     console.log("useEffect: ", props.address)
    //     props.setSelected()
    // }, [props.address.active])
    const status = props.address.contract_type === "Hourly" ? "Hourly" : props.address.status

    const cardBg = () => {        
        if (props.address.active === false) return `rgba(255,0,0,0.5)`
        else if (props.address.temp) return `rgba(255,110,0,0.5)`
        else return null
    }

    const cardStyle = {
        margin: '3px',
        padding: '3px',
        borderRadius: "10px",
        border: props.address?.key === props.activeProperty?.key ? "7px solid rgb(55,90,127)" : "none",
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
        padding: "1px",
        borderRadius: "10px",
        width: "75px",
        marginBottom: '1em',
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
            visual.push(<div key="1" style={{...priorityStyle, backgroundColor:`rgba(0,255,0,0.7)`}}>PRIORITY</div>)            
        } else if (props.address.service_level) {
            levelText = serviceLevels[props.address.service_level]
            for (let i = 1; i < 5; i++) {
                if (i <= level) {
                    visual.push(<div key={i} style={{...dotStyle, backgroundColor:`rgba(0,255,0,0.7)`}}>{" "}</div>)
                } else {
                    visual.push(<div key={i} style={{...dotStyle, backgroundColor:`rgba(0,0,0,0.7)`}}>{" "}</div>)
                }
            }
        }  
        return (
            <>
                <Col>{levelText}{visual}</Col> 
                
            </>
        )
    }

    const RouteString = () => {
        let routes = 'Routes Assigned: '
        routeData.forEach((entry, i) => {                                        
            if (entry.property_key === props.address?.key) {
                routes += `${entry.route_name}, `                   
            }            
        })
        return <p>{routes}</p>
    }

    const toggleActive = () => {
       // dispatch({ type: ROUTE_DATA_PENDING})
        let item = {
            table: 'route_data',
            newItem: {active: !props.address.active},
            whereObj: {
                property_key: props.address.key,
                route_name: props.route.name,
            }
        }
        fetch(`${process.env.REACT_APP_API_URL}/edititem`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item)
        })
        .then(res => res.json())
        .then(updated => {
            console.log("updated: ", updated)
            let newItems = [...routeData]
            newItems[routeData.findIndex(item => item.property_key === updated[0].property_key)].active = updated[0].active
           // dispatch({ type: ROUTE_DATA_SUCCESS, payload: newItems})
           // dispatch(requestAllAddresses())
            props.refreshData()
        })
        .catch(err => dispatch({ type: GET_ITEMS_FAILED, payload: err}))
    }

    return(
        <Row id={`card${(typeof(props.i) === 'number') ? props.i : props.address.key}`} style={cardStyle} onClick={() => props.handleClick(props.address)}>
            <Col style={{flex:"2 1 auto"}}>
                <h5 style={{textAlign: "left", fontWeight: "bold"}}>  
                {typeof(props.i) === 'number'  ? props.i + 1 + '. ' : ''}{props.address ? props.address.cust_name ? props.address.cust_name : "name" : "name"}{props.address ? props.address.is_new ? "*" : null : null}            
                </h5> 
                <p style={{color: "rgba(255, 255, 255, 0.7)"}}>{props.address ? props.address.address ? props.address.address : "address" : "address"} </p>  
                {props.admin ? <RouteString /> : null}                     
            </Col>
            <ServiceLevel />
            <Col style={{flex:"1 1 75px"}}>
            {(typeof(props.address.route_position) === "number") ?  
                <>
                    <p style={{...statusStyle}}>{status}</p>   
                    {props.admin ? <Button style={activeStyle} onClick={toggleActive}>{props.address.active === true ? 'Active' : 'Inactive'}</Button> : null} 
                </>     
                    : <p></p>
                } 
                {props.admin ? <p style={editStyle}><Button variant="secondary" onClick={() => props.detailsClick(props.address)}>Details</Button></p>  : null } 
            </Col>      
        </Row>
    )
}   

export default PropertyCard