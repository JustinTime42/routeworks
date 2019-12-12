import React from 'react'
import '../styles/driver.css'

const PropertyDetails = (props) => {
    return (
        <div>{props.property ? props.property.address : null}</div>
    )
}

export default PropertyDetails