import React, { useState, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentUser } from '../actions'
import HomePage from "../containers/Home"
import {BrowserRouter as Router, Route, Switch} from "react-router-dom"
import CallbackPage from "../auth/Callback"
import Auth from "../auth/Auth"
import { UserLogin } from '../auth/UserLogin'
import Driver from "../containers/Driver"
import "../App.css"
// Import Parse minified version
import Parse from 'parse/dist/parse.min.js';

// Your Parse initialization configuration goes here
const PARSE_APPLICATION_ID = 'F9woWDILIrqv5eElFUevlJBrenx1Ca7BJsDNL2MA';
const PARSE_HOST_URL = 'https://parseapi.back4app.com/';
const PARSE_JAVASCRIPT_KEY = '8IDqhrfkxT5wBtpPhBtvKqTQRF8lOH70hvICMe0r';
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_HOST_URL;

function App() { 
  
  const currentUser = useSelector(state => state.setCurrentUser?.currentUser)
  useEffect(() => {
    console.log(currentUser?.get('fullName'))
  }, [currentUser])


    return (
        <div className="App">
          {
            currentUser ? 
            <Driver />
          : <UserLogin />
          }
          
          {/* <Auth>
            <Router>
                  <Switch>
                    <Route exact path="/" component={HomePage}/>
                    <Route path="/callback" component={CallbackPage}/>
                  </Switch>
                </Router>     
          </Auth>       */}
        </div>       
    )  
  }
  export default App