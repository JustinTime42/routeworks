import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { db } from '../firebase';
import { GET_TRACTORS_SUCCESS, REQUEST_ROUTES_SUCCESS } from '../constants';
import { collection, onSnapshot, doc, getDoc, Timestamp, updateDoc, deleteField } from "firebase/firestore"
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';
import axios from 'axios';


const MapComponent = ({vehicles, paths}) => {
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({lat: 61, lng: -150});
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyA6XjIu8LiWPxKcxaWnLM_YOOUcmp2bAsU"
  });

  const getCenter = (vehicles) => {
    const lat = vehicles.reduce((sum, vehicle) => sum + vehicle.location.lat, 0) / vehicles.length;
    const lng = vehicles.reduce((sum, vehicle) => sum + vehicle.location.lng, 0) / vehicles.length;
    return {lat, lng};
  }


  if (!isLoaded) return <div>Loading...</div>;
  return (
    <GoogleMap 
      zoom={12} 
      center={getCenter(vehicles)}
      mapContainerStyle={{ width: '100%', height: '100vh' }}

    >
        { vehicles.map(vehicle => (
            <Marker 
              key={vehicle.id} 
              position={{ lat: vehicle.location.lat, lng: vehicle.location.lng }} 
              label= {vehicle.name}
            />
        ))}
        {/* 
        leaving this out for now. 
        { paths.map(path => (
            <Polyline
              path={path || []}
              options={{
                  strokeOpacity: 1,
                  strokeWeight: 3,
              }}
            />
          // <Polyline key={key} path={routes[key].route.map(address => convertToLatLng(address))} />
        ))} */}

    </GoogleMap>
  );
}

export default MapComponent;