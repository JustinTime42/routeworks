import { addDoc, collection, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore"; 
import { db } from '../firebase'


export const setItem = (item, collection) => {
  const {id, ...rest} = item
  setDoc(doc(db, collection, id), {...rest})
  .then(() => console.log('success', id))
  .catch(err => console.log(err))
}

export const getCustFields = (customer) => {
  return {
    cust_name: customer.cust_name || '',
    cust_fname: customer.cust_fname || '',
    cust_lname: customer.cust_lname || '',
    cust_phone: customer.cust_phone || '',
    cust_email: customer.cust_email || '',
    cust_email2: customer.cust_email2 || '',
    include_email2: customer.include_email2 || false,
    bill_address: customer.bill_address || '',
    bill_city: customer.bill_city || '',
    bill_state: customer.bill_state || '',
    bill_zip: customer.bill_zip || '',
    tags: customer.tags || [],
    date_created: customer.date_created || '',
    stripeID: customer.stripeID || '',
    id: customer.id || '',
  }
}
// this will be the real one
export const getLocationFields = (customer) => {
  return {
    service_address: customer.service_address || '',
    service_city: customer.service_city || '',
    service_state: customer.service_state || '',
    service_zip: customer.service_zip || '',
    pricing: customer.pricing || {},
    surface_type: customer.surface_type || '',
    service_level: customer.service_level || '',
    routesAssigned: customer.routesAssigned || {},
    date_created: customer.date_created || '',
    cust_id: customer.cust_id || '',
    id: customer.loc_id || '',
    location: customer.location || '',
  }
}

// this is just for migrating
// export const getLocationFields = (customer) => {
//   return {
//     service_address: customer.service_address || '',
//     service_city: customer.service_city || '',
//     service_state: customer.service_state || '',
//     service_zip: customer.service_zip || '',
//     pricing: customer.pricing || {},
//     pricingTemplate: customer.pricingTemplate || {},
//     surface_type: customer.surface_type || '',
//     service_level: customer.service_level || '',
//     routesAssigned: customer.routesAssigned || {},
//     date_created: customer.date_created || '',    
//     cust_id: customer.id || '',
//     notes: customer.notes || '',
//     value: customer.value || '',
//     id: customer.id || '',
//   }
// }