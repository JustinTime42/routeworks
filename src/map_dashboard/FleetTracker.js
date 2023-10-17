
import React, { useEffect } from 'react';
import MapComponent from './MapComponent';
import { useDispatch, useSelector } from 'react-redux';
import { db } from '../firebase';
import { GET_TRACTORS_SUCCESS, REQUEST_ROUTES_SUCCESS } from '../constants';
import { collection, onSnapshot } from "firebase/firestore"
import axios from 'axios';

const FleetTracker = () => {
  const vehicles = useSelector(state => state.getTractors.allTractors);
  const routes = useSelector(state => state.requestRoutes.routes);
  const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization);
  const dispatch = useDispatch();

  const convertToLatLng = (address) => {
    return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address='${address.service_address}, ${address.service_city || ""}, ${address.service_state || ""}, ${address.service_zip || ""}'&key=AIzaSyAWlCgbe0nXrdjQ9Fp71KEZDXtNJlwKtEw`)
    .then(function (response) {
      console.log(response)
      let data = response.data.results[0]?.geometry?.location;
      return {lat: data?.lat, lng: data?.lng}; 
    })
    .catch((error) => {
      console.error(error);
    })
  }

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, `organizations/${organization}/vehicle`), (querySnapshot) => {
      dispatch({type:GET_TRACTORS_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
    });
    return () => unsubscribe();
  },[]);  

  const getVehiclePositions = (vehicles) => {
    return vehicles.filter(vehicle => vehicle.active && vehicle.location)
  }

  const getRoutePaths = (routes) => {
    const routePaths = [];
    routes.filter(route => route.active).forEach(route => {
      const path = [];
      Object.keys(route.customers).forEach(customer => {
        console.log(route.customers[customer].location)
        if (route.customers[customer].location) {
          
          path.push(route.customers[customer].location);
        }        
      });
      routePaths.push(path);
    });
    console.log(routePaths)
    return routePaths;
  }

  return(
    <div>
      <h1>Fleet Tracker</h1>
      <MapComponent
        googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyAWlCgbe0nXrdjQ9Fp71KEZDXtNJlwKtEw"
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `400px` }} />}
        mapElement={<div style={{ height: `100%` }} />}
        vehicles={getVehiclePositions(vehicles)}
        paths={getRoutePaths(routes)}
      />
    </div>
  );
}

export default FleetTracker;