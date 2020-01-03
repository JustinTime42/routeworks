import React from 'react'
import { Button } from 'react-bootstrap'

const BlackoutButton = () => {
    
    const goActive = () => { 
    if (document.getElementById("blackOutScreen")){
        document.getElementById("blackOutScreen").style.height="100%"
    }    
    }  

    return (
        <Button variant="primary" onClick={goActive}>Black Out</Button>
    )
}

export default BlackoutButton