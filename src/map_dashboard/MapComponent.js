import React, {useEffect} from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';


const MapComponent = ({vehicles, paths}) => {
  const [center, setCenter] = React.useState(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyA6XjIu8LiWPxKcxaWnLM_YOOUcmp2bAsU"
  });

  useEffect(() => {
    const lat = vehicles.reduce((sum, vehicle) => sum + vehicle.location.lat, 0) / vehicles.length;
    const lng = vehicles.reduce((sum, vehicle) => sum + vehicle.location.lng, 0) / vehicles.length;    
    const getPosition = async() => {
      await navigator.geolocation.getCurrentPosition((position) => {
        setCenter({lat: position.coords.latitude, lng: position.coords.longitude})
      })
    }
    if (isNaN(lat) || isNaN(lng)) {
      getPosition()
    }
    else setCenter({lat, lng});    
  }, [])

  if (!isLoaded || !center) return <div>Loading...</div>;
  else return (
    <GoogleMap 
      zoom={12} 
      center={center}
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