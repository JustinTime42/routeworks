import React from 'react'
import Blackout from "../components/Blackout"
import HomePage from "../containers/Home"
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import CallbackPage from "../auth/Callback";
import Auth from "../auth/Auth";
import { io } from "socket.io-client";
import "../App.css"

function App() { 

    const socket = io('https://snowline-route-manager.herokuapp.com/')
    socket.on('connect', () => {
      socket.emit('hi', "hello, i'm here");
      socket.on('welcome-msg', data => console.log(data))
    });
    socket.on('err', err => alert(err))

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