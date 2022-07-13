import React from "react"
import { AuthConsumer } from "../authContext"
import Login from "../components/Login"
import Driver from "./Driver"

const HomePage = () => (
  <AuthConsumer>
    {({ authenticated }) =>
      authenticated ? (                    
        <Driver />              
      ) : (
        <div style={{maxWidth:'600px', margin:'auto', paddingTop:'2em'}}>
          <h2>Snowline Alaska.</h2>
          <Login />
        </div>
      )
    }
  </AuthConsumer>
)

export default HomePage;