import React, { Component } from "react"
import Logo from "../spinner.png"
import '../styles/spinner.css'

const Spinner = () => {
    console.log("spinning")
    return (        
        <div className="spinnerContainer">
            <img className="spinner" src={Logo}></img>
        </div>    
    )
}

export default Spinner