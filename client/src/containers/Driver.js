import React from "react"
import RouteSelector from "../components/RouteSelector"
import DriverName from "../components/DriverName"
import DisplayRoute from "../components/DisplayRoute"
import RouteEditor from "../components/RouteEditor"

import '../styles/driver.css'

const Driver = () => {

    return (
        <div className="gridContainer">
            <div className="leftSide">
                <RouteSelector />
                <DriverName />
                <DisplayRoute />
                
            </div>
            <div className="rightSide">
                
            </div> 
            <RouteEditor /> 
        </div>
    )
}

export default Driver