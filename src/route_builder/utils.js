import { addDoc, getDocs, collection, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore"; 
import { db } from '../firebase'
import axios from 'axios'


export const setItem = (item, collection) => {
  const {id, ...rest} = item
  setDoc(doc(db, collection, id), {...rest})
  .then(() => console.log('success', id))
  .catch(err => console.log(err))
}

// not currently used
export const getLatLng = (address) => {
  return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address='${address.service_address}, ${address.service_city || ""}, ${address.service_state || ""}, ${address.service_zip || ""}'&key=AIzaSyAWlCgbe0nXrdjQ9Fp71KEZDXtNJlwKtEw`)
  .then(function (response) {
    console.log(response)
    let data = response.data.results[0]?.geometry?.location;
    if (data) {
      return {lat: data?.lat, lng: data?.lng}; 
    }
      else return null      
  })
  .catch((error) => {
    console.error(error);
  })
}



// export const migrateCustomers = async(organization) => {
//   const querySnapshot = await getDocs(collection(db, `organizations/${organization}/customer`));
//   querySnapshot.forEach((doc) => {
//       const customer = {...doc.data(), id: doc.id}
//       setItem(getCustFields(customer), `organizations/${organization}/customers`)
//       setItem(getLocationFields(customer), `organizations/${organization}/service_locations`)
//   });
// }