import React from 'react'
import '../styles/driver.css'

const PropertyDetails = (props) => {
    return (
        <div>{props.property.address}</div>
    )
}

export default PropertyDetails