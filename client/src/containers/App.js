import React, { useState, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useIdleTimer } from 'react-idle-timer'
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

const App = (props) => { 
  const isTimerRunning = useSelector(state => state.setTimerIsRunning.timerIsRunning)
  const dispatch = useDispatch()
  const timeout = 100000
  
  let currentUser = useSelector(state => state.setCurrentUser.currentUser)
  const handleOnIdle = () => handleLogout()

  const {
    isIdle,
    pause,
    resume
  } = useIdleTimer({
    timeout,
    onIdle: handleOnIdle
  })

  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async function () {
    const user = await Parse.User.current();
    dispatch(setCurrentUser(user))    
  };

  // now I need to be able to pause the idle time using the "pause" method if hourly timer is running
  const handleLogout = async function () {
    if (currentUser) {
      console.log("logging out")
      try {
        await Parse.User.logOut();
        const currentUser = await Parse.User.current();
      dispatch(setCurrentUser(null))
        return true;
      } catch (error) {
        alert(`Error! ${error.message}`);
        return false;
      }
    }
    
  };

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