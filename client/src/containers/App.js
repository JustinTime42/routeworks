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
import { initializeParse, useParseQuery } from  '@parse/react';

initializeParse(
  'https://routemanager.b4a.io/',
  'F9woWDILIrqv5eElFUevlJBrenx1Ca7BJsDNL2MA',
  '8IDqhrfkxT5wBtpPhBtvKqTQRF8lOH70hvICMe0r',
)

const PARSE_APPLICATION_ID = 'F9woWDILIrqv5eElFUevlJBrenx1Ca7BJsDNL2MA';
const PARSE_HOST_URL = 'https://parseapi.back4app.com/';
const PARSE_JAVASCRIPT_KEY = '8IDqhrfkxT5wBtpPhBtvKqTQRF8lOH70hvICMe0r';
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_HOST_URL;

Parse.enableLocalDatastore()

const App = (props) => { 
  const isTimerRunning = useSelector(state => state.setTimerIsRunning.timerIsRunning)
  const dispatch = useDispatch()
  const timeout = 100000
  
  let currentUser = useSelector(state => state.setCurrentUser.currentUser)
 // const handleOnIdle = () => handleLogout()

  // const userQuery = new Parse.Query('_User');
  // const {
  //    isLive,
  //    isLoading,
  //    isSyncing,
  //    results,
  //    count,
  //    error,
  //    reload
  //  } = useParseQuery(userQuery);


  useEffect(() => {
    console.log(currentUser)
  }, [currentUser])



  // const getCurrentUser = async function () {
  //   const user = await Parse.User.current();
  //   console.log(user)
  //   dispatch(setCurrentUser(user))    
  // };

  // now I need to be able to pause the idle time using the "pause" method if hourly timer is running
  // 

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