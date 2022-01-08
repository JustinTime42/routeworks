// src/index.js
import "bootswatch/dist/darkly/bootstrap.min.css"; 
import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import App from './containers/App'
import thunkMiddleWare from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { setActiveRoute, requestRoutes, setActiveDriver, setActiveTractor, requestAllAddresses, getRouteProperties, setActiveProperty, saveRoute, showRouteEditor, getDrivers, getTractors, getRouteData, filterProperties, getTractorTypes, setActiveVehicleType, setCurrentUser } from './reducers';
//import "./index.css"

const logger = createLogger()
const rootReducer = combineReducers( { setActiveRoute, requestRoutes, setActiveDriver, setActiveTractor, requestAllAddresses, getRouteProperties, setActiveProperty, saveRoute, showRouteEditor, getDrivers, getTractors, getRouteData, filterProperties, getTractorTypes, setActiveVehicleType, setCurrentUser })
const store = createStore(rootReducer, applyMiddleware(thunkMiddleWare, logger))
const rootElement = document.getElementById("root");

ReactDOM.render(
  <Provider store={store}>    
    <App/>
  </Provider>, rootElement);

serviceWorker.unregister();