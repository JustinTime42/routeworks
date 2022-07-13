import React from "react"
import { Button } from "react-bootstrap"
import screenfull from "screenfull"

const FullScreen = () => {
    const fullScreenClick = () => {
        screenfull.toggle();
        console.log(screenfull.isFullscreen)
    }
    return (
        <Button variant="primary" onClick={fullScreenClick}>Screen</Button>
    )
   
}

export default FullScreen