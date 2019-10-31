import React from "react"
import RouteSelector from "../components/RouteSelector"
import DriverName from "../components/DriverName"
import AddressList from "../components/AddressList"

import '../styles/driver.css'

const Driver = () => {

    return (
        <div className="gridContainer">
            <div className="leftSide">
                <RouteSelector />
                <DriverName />
            </div>
            <div className="rightSide">
                <AddressList />
            </div>

           
            {/* This is where the Driver page components will go */}
        </div>
    )

}



export default Driver