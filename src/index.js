// src/index.js
import 'bootstrap/dist/css/bootstrap.min.css';  
import "bootswatch/dist/darkly/bootstrap.min.css"; 
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import App from './App'
import thunkMiddleWare from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { setActiveRoute, requestRoutes, setActiveDriver, setActiveTractor, requestAllAddresses, setActiveProperty, getTractors, filterProperties, getTractorTypes, setActiveVehicleType, setActiveWorkType, getWorkTypes, whichModals, setTempItem, setTimerIsRunning, setCurrentUser, setLogs, setActiveLogEntry } from './reducers';
//import "./index.css"

const logger = createLogger()
const rootReducer = combineReducers( { setActiveRoute, requestRoutes, setActiveDriver, setActiveTractor, requestAllAddresses, setActiveProperty, getTractors, filterProperties, getTractorTypes, setActiveVehicleType, setActiveWorkType, getWorkTypes, whichModals, setTempItem, setTimerIsRunning, setCurrentUser, setLogs, setActiveLogEntry })
const store = createStore(rootReducer, applyMiddleware(thunkMiddleWare, logger))
const rootElement = document.getElementById("root");

ReactDOM.render(
  <Provider store={store}>  
    <BrowserRouter>
      <App/>
    </BrowserRouter>    
  </Provider>, rootElement);

serviceWorker.unregister();