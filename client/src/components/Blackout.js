import React from "react"

const Blackout = () => {
    const divStyle = {
        margin: '-1em',
        // padding: '2em',
        width: '110%',
        backgroundColor: 'black',
        position: 'absolute',
        zIndex: 99,
    };
    return (
        <div 
            style={divStyle}
            className="blackOut" 
            id="blackOutScreen">
        </div>
    )
} 

export default Blackout