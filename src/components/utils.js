import { addDoc, getDocs, collection, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore"; 
import { db } from '../firebase'

export const scrollCardIntoView = (custIndex) => {
    const card = document.getElementById(`card${custIndex}`)
    if (!card) return
    const bounding = card.getBoundingClientRect();
    if (
        bounding.top >= 0 && 
        bounding.left >= 0 && 
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth) && 
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        ) {
        return        
    } else {
        setTimeout(() => card.scrollIntoView(), 300)
    }
}

// moved this to DisplayRoute to take advantage of the properly calculated route properties 
// export const changeActiveProperty = (property, direction = '', routeCustomers) => {
//     if (direction) {
//         let currentPosition = routeCustomers[property.id].routePosition
//         let nextPosition
//         let nextCustomerId = ''
//         const customerKeysArray = Object.keys(routeCustomers)
//         const setNextCustomer = (direction, current) => {
//             console.log(current)
//             console.log(isPropertyWithinTempDates(property))
//             nextPosition = (direction === 'next') ? current + 1 : current - 1
//             nextCustomerId = customerKeysArray.find(customerId => (
//                 routeCustomers[customerId].routePosition === nextPosition
//             ))
//             console.log(nextCustomerId)
//             if ((!routeCustomers[nextCustomerId].active || !isPropertyWithinTempDates(routeCustomers[nextCustomerId])) && 
//                 (nextPosition < customerKeysArray.length)) {
//                     setNextCustomer(direction, nextPosition)
//             } else {
//                 console.log(routeCustomers[nextCustomerId].routePosition)
//                 return nextCustomerId
//             }
//         }
//         setNextCustomer(direction, currentPosition)
//         // let isNextCustomerActive = false
//         // do {
//         //     setNextCustomer(direction, currentPosition)
//         //     if(routeCustomers[nextCustomerId].active) {
//         //         //nextCustomer = routeCustomers[nextPosition]
//         //         isNextCustomerActive = true
//         //     }
//         // }
//         // while ((isNextCustomerActive === false) && (nextPosition < customerKeysArray.length))
//         if (nextPosition >= 0 && nextPosition <= customerKeysArray.length) {           
//             if ((nextPosition - 1) > 0) {
//                 document.getElementById(`card${nextPosition - 1}`).scrollIntoView(true)
//             } else {
//                 document.getElementById(`card${nextPosition}`).scrollIntoView(true)
//             }
//             return nextCustomerId
//         }                 
//     } else {
//         return property.id
//     }
// }

export const isPropertyWithinTempDates = (property) => {
    const offset = new Date().getTimezoneOffset() * 60000
    const start = property.tempRange?.start ? (property.tempRange?.start?.toDate())?.getTime() + offset : ""
    const end = property.tempRange?.end ? (property.tempRange?.end?.toDate())?.getTime() + offset + 86400000 : ""
    const now = new Date(Date.now())
    if (start && end && (start <= now) && (end >= now)) {
        return true
    } 
    else if (!end && (start <= now)) {
        return true
    }
    else if (!start && (end >= now)) {
        return true
    }
    else if (!property.tempRange) {
        return true
    } else return false
}

export const toLocalTime = (time) => {
    const offset = new Date().getTimezoneOffset() * 60000
    return new Date(time - offset)
}

export const toHRDateFormat = (time) => {
    return new Date(time).toLocaleDateString("en-US", {timeZone: "America/Anchorage"})
}

export const toHRTimeFormat = (time) => {
    return new Date(time).toLocaleTimeString("en-US", {timeZone: "America/Anchorage"})
}

export const setItem = (item, collection) => {
  const {id, ...rest} = item
  console.log(item)
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
      date_created: customer.date_created || new Date(Date.now()),
      stripeID: customer.stripeID || '',
      id: customer.cust_id || "",
      combineInvoice: customer.combineInvoice || false,
    }
  }
  // this will be the real one
  export const getLocationFields = (customer) => {
    return {
      cust_name: customer.cust_name || '',
      service_address: customer.service_address || '',
      service_city: customer.service_city || '',
      service_state: customer.service_state || '',
      service_zip: customer.service_zip || '',
      pricing: customer.pricing || {},
      pricingTemplate: customer.pricingTemplate || {},
      surface_type: customer.surface_type || '',
      service_level: customer.service_level || '',
      routesAssigned: customer.routesAssigned || {},
      date_created: customer.date_created || new Date(Date.now()),
      cust_id: customer.cust_id || '',
      notes: customer.notes || '',
      value: customer.value || '',
      id: customer.loc_id || '',
      location: customer.location || '',
    }
  }
  
  // this is just for migrating
  // export const getLocationFields = (customer) => {
  //   if (!customer.id) {
  //     console.log("ERROR NO CUSTOMER ID ")
  //     return null
  //   }
  //   console.log(customer.id)
  //   return {
  //     cust_name: customer.cust_name || '',
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
  //     id: customer.id,
  //     location: customer.location,
  //   }
  // }