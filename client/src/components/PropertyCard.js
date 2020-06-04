
import React from 'react'
import { Button } from 'react-bootstrap'
//import { shallow, mount, render } from 'enzyme'

const PropertyCard = (props) => {
    const route = props.route  

    const findRouteData = (prop) => {
        return props.address.route_data.some(item => item.route_name === route) ?
            props.address.route_data.find(item => item.route_name === route)[prop] : null
    }
    const status = findRouteData("status")
    const route_position = findRouteData("route_position") !== null ? (findRouteData("route_position") + 1) + ". " : ""
    const route_list = props.address.route_data.map(item => item.route_name + ", ")
    // const status = props.address.route_data.some(item => item.route_name === route) ?
    // props.address.route_data.find(item => item.route_name === route).route_position : null
         
    // const route_position = props.address.route_data.some(item => item.route_name === route) ?
    //         props.address.route_data.find(item => item.route_name === route).status : null 
              
    const routePosition = props.i >= 0 ? `${props.i + 1}. ` : ''
    
    const cardBg = () => {
        if (props.address.inactive === true) return `rgba(231,76,60,0.7)`  
        else if (props.address.temp) return `rgba(235,185,5,0.7)`
        else if (props.activeProperty && props.activeProperty.key === props.address.key) return '#4E8098'
        else return null
    }
    const cardStyle = {
        margin: '3px',
        padding: '3px',
        width: props.width,
        backgroundColor: cardBg(), //props.address.temp ? `rgba(231,76,60,0.7)` : props.activeProperty ? props.activeProperty.key === props.address.key ? '#4E8098' : '#303030   ' : null
    }
    const rightStyle = {
        float: "right", 
        textAlign: "center",
        width: "70px",               
    }

    const statusStyle = {
        padding: "10px",
        border: "2px, solid, black",
        borderRadius: "10px",
        backgroundColor: status === "Waiting" ? `rgba(255,200,0,0.9)` : 
            status === "Skipped" ? `rgba(255,0,0,0.7)` :
            status === "Done" ? `rgba(0,255,0,0.7)` : null
    }

    const seasonalStyle = {
        display: "inline",
        float: "left",
        padding: "5px",
        border: "1px, solid, #CCE5FF",
        borderRadius: "5px",
        backgroundColor: props.address ? props.address.seasonal ? "#375A7F" : `rgba(0,0,0,0.0)` : `rgba(0,0,0,0.0)`
    }

    const editStyle = {
        verticalAlign: "bottom"
    }

    return(
        <div id={`card${route_position}`} style={cardStyle} onClick={() => props.handleClick(props.address)}>
            <div style={rightStyle}>
                <div style={seasonalStyle}></div>
                {props.address ? 
                    <p style={statusStyle}>{status}</p> : <p style={statusStyle}></p>             
                } 
                {props.admin === true ? 
                    <p style={editStyle}><Button variant="secondary" onClick={() => props.editClick(props.address)}>Edit </Button></p>  : <p></p>               
                }
            </div>

            <h5 style={{textAlign: "left", width: "100%", fontWeight: "bold"}}>  
            {route_position}{props.address ? props.address.cust_name ? props.address.cust_name : "name" : "name"}{props.address ? props.address.is_new ? "*" : null : null}            
            </h5>                             
            <p style={{color: "rgba(255, 255, 255, 0.7)"}}>{props.address ? props.address.address ? props.address.address : "address" : "address"} </p>            
            {props.admin ? <p>route: {route_list}</p> : <div></div>}
        </div>
    )
}   

export default PropertyCard

