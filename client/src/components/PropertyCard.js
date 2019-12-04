import React from 'react'

const PropertyCard = (props) => {
    const cardStyle = {
        margin: '3px',
        padding: '3px',
        width: props.width,
        backgroundColor: props.activeProperty ? props.activeProperty.address === props.address.address ? '#DCBD61' : '#BCD4DE' : null
    }

    const statusStyle = {
        float: "right", 
        textAlign: "center",
        width: "70px",
        border: "2px, solid, black",
        borderRadius: "10px",
        padding: "10px",
        backgroundColor: props.address.status === "waiting" ? "yellow" : 
            props.address.status === "skipped" ? "red" :
            props.address.status === "done" ? "green" : null
    }

    return(
        <div style={cardStyle} onClick={() => props.handleClick(props.address)}>
            {props.address.status ? 
                    <p style={statusStyle}>{props.address.status}</p>  : <p style={statusStyle}></p>             
            } 
            <p style={{textAlign: "left", width: "100%"}}>
                {props.address.cust_name}                
            </p>                             
            <p>{props.address.address}</p>            
            {props.admin ? <p>route: {props.address.route_name}</p> : <div></div>}
        </div>
    )
}   

export default PropertyCard

