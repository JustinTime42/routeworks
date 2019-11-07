import React from "react"
import RouteSelector from "../components/RouteSelector"
import DriverName from "../components/DriverName"
import DisplayRoute from "../components/DisplayRoute"
//import PropertyDragger from "../components/PropertyDragger"

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
                {/* <PropertyDragger /> */}
            </div>           
            {/* This is where the Driver page components will go */}
        </div>
    )
}

export default Driver