import React from "react"

const Blackout = () => {
    const goInactive = () => {
        if (document.getElementById("blackOutScreen")){
          document.getElementById("blackOutScreen").style.height="0%"
        }        
      }

    const divStyle = {
        
        width: '100vw',
        backgroundColor: 'black',
        position: 'absolute',
        zIndex: 999,
        
    };
    return (
        <div 
            style={divStyle}
            className="blackOut" 
            id="blackOutScreen"
            onClick={goInactive}>
        </div>
    )
} 

export default Blackout