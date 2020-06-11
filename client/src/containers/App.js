import React from 'react'
import Blackout from "../components/Blackout"
import HomePage from "../containers/Home"
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import CallbackPage from "../auth/Callback";
import Auth from "../auth/Auth";
import "../App.css"

function App() { 
  
    return (
        <div className="App">
          <Auth>
            <Blackout />
            <Router>
                  <Switch>
                    <Route exact path="/" component={HomePage}/>
                    <Route path="/callback" component={CallbackPage}/>
                  </Switch>
                </Router>     
          </Auth>      
        </div> 
    )  
  }

  export default App