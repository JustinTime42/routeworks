// src/index.js
import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import Blackout from "./components/Blackout"
import HomePage from "./components/Home"
import Admin from "./containers/Admin"
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import CallbackPage from "./components/Callback";
import Auth from "./components/Auth";

function App() { 

  let timeoutID;

  function setup() {
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("touchmove", resetTimer, false);
    startTimer();
  }
  setup();

  function startTimer() {
    timeoutID = window.setTimeout(goInactive, 5000);
  }

  function resetTimer(e) {
    window.clearTimeout(timeoutID);
    setup();
  }

  function goInactive() {
    window.addEventListener("mousemove", goActive);
    document.getElementById("blackOutScreen").style.height="100%"  
  }

  function goActive() { 
    document.getElementById("blackOutScreen").style.height="0%"   
  }  

  return (
      <div className="App">
        <Auth>
          <Blackout />
          <Router>
                <Switch>
                  <Route exact path="/" component={HomePage}/>
                  <Route path="/admin" component={Admin}/>
                  <Route path="/callback" component={CallbackPage}/>
                </Switch>
              </Router>     
        </Auth>      
      </div> 
  )
    
}


const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);

serviceWorker.unregister();