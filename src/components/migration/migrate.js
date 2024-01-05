import { indexedDBLocalPersistence } from "firebase/auth";
import { addDoc, setDoc, collection, doc, getDocs, getDoc, Timestamp, where, query } from "firebase/firestore";
import {auth, httpsCallable, functions} from '../../firebase'
import { db } from "../../firebase";
import { getDiff } from "../auditor/utils";
import _ from 'lodash'
import axios from "axios";

const addedDocs = []
const sendToDB = async(item, path) => {
    let {id, ...newItem} = item
    setDoc(doc(db, path, id), {...newItem}, { merge: false }).then(result => {
      console.log(result)
    }).catch(error => console.log(error))       
}

// Go through each route, and each customer on the route, check that their routesAssigned[routeID], else add it. 
// then go through all customers, check routesAssigned for routes that don't exist and delete them
export const fixRoutesAssigned = (routes, allCustomers) => {
    const clonedCustomers = _.cloneDeep(allCustomers)
    const clonedRoutes = _.cloneDeep(routes)
    let count = 0
    // Make sure the customers routesAssigned have a value for each place they appear on the route   
    clonedRoutes.forEach((route, i) => {
        Object.keys(route.customers).forEach(customer => {
            const newCustomer = clonedCustomers[clonedCustomers.findIndex(i => i.id === customer)]
            if (!newCustomer.routesAssigned[route.id]) {
                //console.log(_.cloneDeep(newCustomer))
                newCustomer.routesAssigned[route.id] = route.name
                console.log("adding route to customer: ", newCustomer) 
               sendToDB(newCustomer, 'organizations/Snowline/service_locations')
                count ++  
            }
        })
    })

    // Make sure there aren't any routes listed under routesAssigned that aren't in the routes documents.
    clonedCustomers.forEach((customer, i) => {
        const routesAssigned = Object.keys(customer.routesAssigned)
        routesAssigned.forEach(i => {
            const route = clonedRoutes.find(route => route.id === i)
            const isCustomerOnRoute = route?.customers[customer.id]  // .find(j => j.id === customer.id)
            if (route && isCustomerOnRoute){
                return 
            } else {
                console.log(route)
                // console.log(_.cloneDeep(customer))
                delete customer.routesAssigned[i]
                console.log(`removed ${route?.name} from routesAssigned in ${customer.cust_name}`)
                console.log(_.cloneDeep(customer))
                count ++ 
               sendToDB(customer, 'organizations/Snowline/service_locations')
            }                
        })
    })
    console.log(count)
}

export const migrateBasic = async (oldPath, newPath) => {
    let waitTime = 0
    try {
        const querySnapshot = await getDocs(collection(db, oldPath))
        waitTime = querySnapshot.length
        console.log(`waiting ${waitTime / 10000} seconds`)
        await querySnapshot.forEach((doc,i) => {  
            if (!doc.id) {console.log('missing ID')}
                let timeout = setTimeout(() => sendToDB({...doc.data(), id: doc.id}, newPath), i*10) 
        })
    }
    catch(error) {alert(error)} 
    let newTimeout = setTimeout(() => console.log(addedDocs), waitTime*10 + 500)
}

export const addEmailsToLogs = async(customers) => {
    try {
        const querySnapshot = await getDocs(collection(db, 'organizations/Snowline/service_logs'))
       // console.log(querySnapshot)
        let waitTime = 0
        await querySnapshot.forEach(doc => {
            let entry = {...doc.data(), id: doc.id}            
            if (!entry.cust_email) {
                const customer = customers.find(i => i.id === entry.cust_id)
                if (customer && customer.cust_email) {
                    entry.cust_email = customer.cust_email                    
                    //sendToDB(entry, 'organizations/Snowline/service_logs', i)
                    setTimeout(() => sendToDB(entry, 'organizations/Snowline/service_logs'), waitTime*10)
                    waitTime++
                }                
            }            
        })
        console.log(addedDocs)
    }
    catch(err) {alert(err)}
}

export const migrateCustomers = () => {
    let allCustomers = {}
    let allRoutes = []
    fetch(`${process.env.REACT_APP_API_URL}/properties`)
    .then(response => response.json())
    .then(async(customers) => {
        const querySnapshot = await getDocs(collection(db, "driver/driver_lists/route"));
        querySnapshot.forEach(route => {
            allRoutes.push({...route.data(), id: route.id})
        })
        console.log(allRoutes)
        customers.forEach(async(item) => {
        let newItem = {
           // key: item.key, // this needs to be here initially for the merge with routedata. delete this field before saving to firestore
            cust_name: item.cust_name,
            cust_fname: item.cust_fname,
            cust_lname: item.cust_lname,
            cust_phone: item.cust_phone,
            surface_type: item.surface_type,
            notes: item.notes,
            routesAssigned: {},                   
            cust_email: item.cust_email,
            cust_email2: item.cust_email2,
            include_email2: item.include_email2,
            service_address: item.address,
            service_city: item.city,
            service_state: item.state,
            service_zip: item.zip,
            bill_address: item.bill_address,
            bill_city: item.bill_city,
            bill_state: item.bill_state,
            bill_zip: item.bill_zip,
            tags: item.tags?.split(','),
            service_level: item.service_level,
            snow_price: item.price,
            sweep_price: item.sweep_price,
            value: item.value,
            price_per_yard: item.price_per_yard,
            season_price: Number(item.season_price),
            contract_type: item.contract_type,
            sand_contract: item.sand_contract,
            Sander: item.Sander,
            date_created: Timestamp.fromDate(new Date(item.date_created)),
            'Work Truck (1 laborer)': item['Work Truck (1 laborer)'],
            'Tractor with snow blower': item['Tractor with snow blower'],
            'Sidewalk snow blower': item['Sidewalk snow blower'],
            'Vacuum sweeper truck': item['Vacuum sweeper truck'],
            Plow: item.Plow,
            'Grader AWD': item['Grader AWD'],
            'Water Truck - Small': item['Water Truck - Small '],
            Laborer: item.Laborer,
            'Asphalt Patching': item['Asphalt Patching'],
            'Compact Track Loader': item['Compact Track Loader'],
            'Dump Truck - small': item['Dump Truck - small'],
            'Excavator - Small': item['Excavator - Small'],
            'Water Truck - 2000 gal': item['Water Truck - 2000 gal'],
            'Vibratory Roller': item['Vibratory Roller'],
            'Traffic Control': item['Traffic Control'],
            'Tree Trimming Labor': item['Tree Trimming Labor'],
            'Tree Debris Hauloff': item['Tree Debris Hauloff']
        }  
        let keysArray = Object.keys(newItem)
        keysArray.forEach(key => {
            if (newItem[key] === null || newItem[key] === undefined) {
                delete newItem[key]
            }
        })          
        allCustomers[item.key] = newItem
    })
    fetch(`${process.env.REACT_APP_API_URL}/routedata`)
    .then(res => res.json())
    .then(routeEntries => {
        routeEntries.forEach(entry => {
            let thisRoute = allRoutes.find(item => item.name === entry.route_name) //find the route in firestore whose name === entry.route_name
            if (!thisRoute) {console.log(entry)}
            else {
                allCustomers[entry.property_key].routesAssigned[thisRoute.id] = entry.route_name
            }
            
        })
        const customersArray = Object.keys(allCustomers) 
        customersArray.forEach(async(customerKey) => {
            const itemRef = doc(db, "driver/driver_lists/customer", customerKey)
            await setDoc(itemRef, allCustomers[customerKey]);
        })

    })
    } )
    .catch(error => alert(error))
}

//this will be for drivers, vehicles, vehicle_types, work_types
// export const migrateBasic = async (oldPath, newPath) => {
//     try {
//         const querySnapshot = await getDocs(collection(db, oldPath))
//         querySnapshot.forEach((doc,i) => {            
//             setTimeout(sendToDB(doc.data(), newPath), i*10) 
//         })
//     }
//     catch(error) {alert(error)} 
//     console.log(addedDocs)

//     // return 
//     // fetch(`${process.env.REACT_APP_API_URL}${oldPath}`)
//     // .then(response => response.json())
//     // .then(data => {
//     //     console.log('data from old database')
//     //     console.log(data)        
//     //     data.forEach(item => {
//     //         let {key, ...newItem} = item
//     //         sendToDB(newItem, newPath)
//     //     })
//     // })
//     // .catch(err => alert(err))
// }


export const migrateRouteData = () => {
    fetch(`${process.env.REACT_APP_API_URL}/routelist`)
    .then(res => res.json())
    .then(data => {
        //now we have an array of routes, with name and key and active
        data.forEach(route => {
            let newRouteObj = {
                name: route.name,
                active: route.active,
                customers: [] //get all customers here
            }
            fetch(`${process.env.REACT_APP_API_URL}/getroute/${route.name}`)
            .then(res => res.json())
            .then(data => {
                data.forEach(customer => {
                   // console.log(customer.route_position)
                    if ((customer.route_position === undefined) || (customer.route_position === null)) {console.log('undefined route_position')}
                    let newCustomer = {
                        active: customer.active || true,
                        service_address: customer.address,
                        cust_name: customer.cust_name,
                        id: customer.property_key.toString(),
                        priority: !!customer.priority || false,
                        service_level: customer.service_level || 0,
                        status: customer.status || 'Waiting',
                        temporary: customer.temp || false,
                        new: customer.is_new || false,
                    }
                    newRouteObj.customers[customer.route_position] =  newCustomer
                }) 
                sendToDB(newRouteObj, 'driver/driver_lists/route')                              
            })                
        })
    })
}

export const routeArrayToMap = (routes) => {
    //iterate through each route, then iterate through the customers array and convert it to a map, using i as route_position
    routes.forEach(route => {
        console.log(route)
        let newRouteCustomers = {}
        route.customers.forEach((customer, i) => {
            let {id, ...newCustomer} =  customer 
            newRouteCustomers[id] = {...newCustomer, routePosition: i}
        })
        console.log(newRouteCustomers)
        sendToDB({...route, customers: newRouteCustomers}, "organizations/Snowline/route")
    })
}

export const migrateTags = async() => {
    console.log('migrating tags')
    const docRef = doc(db, `organizations/Snowline/tags`, 'tags')
    const docSnap = await getDoc(docRef)
    const tags = docSnap.data().tags
    console.log(tags)

    const snowlineRef = doc(db, 'organizations', 'Snowline')
    await setDoc(snowlineRef, {tags:[...tags]}, { merge: true })
    // fetch(`${process.env.REACT_APP_API_URL}/alltags`)
    // .then(response => response.json())
    // .then(async(data) => {
    //     console.log('tags from old database')
    //     console.log(data)
    //     await setDoc(doc(db, "driver", "tags"), {tags:[...data]});
    // })
    // .catch(err => alert(err))
}

//
export const migrateLogs = () => {
   // return 
   console.log('getting logs')
    fetch(`https://snowline-route-manager.herokuapp.com/api/getlogs?type=raw&start=2022-02-03&end=2023-09-30`)
    .then(response => response.json())
    .then(data => {
        console.log('logs from old database')
        console.log(data.length)         
        data.forEach((item, i) => {                
            item.service_address = item.address
            item.cust_id = item.property_key.toString()
            item.driverEarning = item.driver_earning
            item.driver = item.user_name
            item.timestamp = Timestamp.fromDate(new Date(item.timestamp)) //convert to firebase timestamp
            delete item.driver_earning
            delete item.user_name
            delete item.item_code
            delete item.property_key
            delete item.key
            delete item.address
            if ((i % 1000) === 0) {
                console.log(item)
            }
            if (i === (data.length -1)) {
                console.log('last item', i)
            }
            let timeOut
            timeOut = setTimeout(() => sendToDB(item, 'service_logs'), (i*10))
                

        })        
        console.log("done")
    })
    .catch(err => console.log(err))
}

export const fixSandContract = (customers) => {
    customers.forEach(async(customer) => {
        if (!customer.sand_contract) { 
            let newCustomer = {...customer, sand_contract: "Per Visit"}
            delete newCustomer.id
            const itemRef = doc(db, "driver/driver_lists/customer", customer.id)   
            await setDoc(itemRef, newCustomer)           
        } else {
            //console.log(customer.id, customer.sand_contract)
        }
    })
}


export const copyNoRoutesAssigned = (customers, routes) => {
    let emptyObjects = []
    let ids = []
    let results = []
    customers.forEach(customer => {
        if(Object.keys(customer.routesAssigned).length === 0) {
            emptyObjects.push(`${customer.cust_name}\n`)
            ids.push(customer.id)
        }
    })
    console.log(ids)
    routes.forEach((route, i) => {
        route.customers.forEach(customer => {
            if (ids.includes(customer.id)) {
                results.push(`${customer.cust_name} ${route.name}`)
            }
        })
    })
    console.log(results)
    navigator.clipboard.writeText(emptyObjects)
}

// function to iterate through the customers assigned to each route, find the contract_type for the corresponding customer in customers and assign it to the customer on the route
export const assignContractType = (routes, customers) => {
    console.log(routes)
    routes.forEach(route => {
        route.customers.forEach(customer => {
            let found = customers.find(c => c.id === customer.id)
            if (found) {
                customer.contract_type = found.contract_type
            }
        })
    })
    // save each new route to database with a i second delay
    routes.forEach((route, i) => {
        setTimeout(() => {
            sendToDB(route, `organizations/Snowline/route/`)
        }, (i * 1000))
    })
}

export const migrateDates = async() => {
    const querySnapshot = await getDocs(collection(db, "organizations/Snowline/audit_logs"));
    querySnapshot.forEach((doc) => {
        let entry = {...doc.data(), id: doc.id}
        if (typeof(entry.timestamp) === 'string') {
            const newTimeStamp = new Date(Date.parse(entry.timestamp))
            sendToDB({...entry, timestamp: newTimeStamp}, 'organizations/Snowline/audit_logs')
        }
    });    
}

export const addIDToAuditLogs = async() => {
    const querySnapshot = await getDocs(collection(db, "organizations/Snowline/audit_customers"));
    querySnapshot.forEach((doc) => {
        let entry = {...doc.data(), id: doc.id} 
        console.log("Before: ", entry.before)
        console.log("After: ", entry.after)
            const newId = entry.after?.cust_id || entry.before?.cust_id || entry.deleted?.cust_id
            if (!newId) {
                console.log('EMPTY USER ID!!!')
                return
            }
            sendToDB({...entry, cust_id: newId}, 'organizations/Snowline/audit_logs')
    });    
}

//fetch audit logs for the propert time frame
// iterate through them and see what changed
// if only routesAssigned changed, revert
// else push change to changeArray

export const displayBadChanges = async() => {
    let count = 0
    let changes = []
    const start = Timestamp.fromDate(new Date(Date.parse("2023-03-09T17:33:00.000Z"))) 
    const end = Timestamp.fromDate(new Date(Date.parse("2023-03-09T17:33:50.000Z")))
    console.log(start, end)
    const q = query(
        collection(db, "organizations/Snowline/audit_customers"),
        where("timestamp", ">", start),
        where("timestamp", "<", end),
    )
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
        let entry = getDiff({...doc.data(), id: doc.id})
        const {routesAssigned, service_address, timestamp, cust_id, id, ...change} = entry 
        if (Object.keys(change).length > 0) {
            changes.push({...change, id: cust_id, service_address: service_address, timestamp: timestamp})
        }       
    })
    // changes.forEach(entry => {    
    //     if ((count === 0) && (entry.routesAssigned)) {
    //         const newCustomerDetails = {routesAssigned: entry.routesAssigned.before, id: entry.cust_id}
    //         const path = "organizations/Snowline/customer"
    //         sendToDB(newCustomerDetails, path)
    //         console.log(count, entry.cust_id)
    //     }
    //     count++ 
    // })
    return changes
    //console.log(changes)


}



export const migrateCustomerPricing = async() => {
    // get all customers
    // iterate through each customer and build the new pricing schema based on its old pricing fields
    // save each customer to the database
    const querySnapshot = await getDocs(collection(db, `organizations/Snowline/customer`));
    querySnapshot.forEach((doc) => {
        let entry = {...doc.data(), id: doc.id}
        let newPricing = {
            id: 1, 
            name: "Default",
            workTypes:{},
        }
        if (entry.price_per_yard) {            
            newPricing.workTypes.SuBIxJJGubxDks63vAm7 = { // sanding price
                pricingMultiple: entry.sand_contract === "Per Yard" ? "Per Yard" : "Per Visit",
                pricingBasis: "Work Type",
                prices: {
                    "SuBIxJJGubxDks63vAm7": entry?.price_per_yard || 0
                }
            }
        }
        if (entry.contract_type === "Per Occurrence" || entry.contract_type === "Will Call") {
            newPricing.workTypes.XLIwnuFPEr5AbUcjkEnx  = { //snow_price
                pricingMultiple: "Per Visit",
                pricingBasis: "Work Type",
                prices: {
                    "XLIwnuFPEr5AbUcjkEnx": entry?.snow_price ||  0
                }
            }
            newPricing.workTypes.ALJYHCycQxhaXsiSBstX   = { //sweep_price
                pricingMultiple: "Per Visit",
                pricingBasis: "Work Type",
                prices: {
                    "XLIwnuFPEr5AbUcjkEnx": entry?.sweep_price ||  0
                }
            }
        }
        console.log({...entry, pricing: newPricing})
        sendToDB({...entry, pricing: newPricing}, `organizations/Snowline/customer`)
    });
}

const convertToLatLng = (address) => {
    return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address='${address.service_address}, ${address.service_city || ""}, ${address.service_state || ""}, ${address.service_zip || ""}'&key=AIzaSyA6XjIu8LiWPxKcxaWnLM_YOOUcmp2bAsU`)
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

export const addLatLngToCustomers = async() => {
    const querySnapshot = await getDocs(collection(db, `organizations/Snowline/customer`));
    querySnapshot.forEach((doc) => {
        let entry = {...doc.data(), id: doc.id}
        convertToLatLng(entry).then(data => {
            console.log(data)
            sendToDB({...entry, location: data}, `organizations/Snowline/customer`)
        })
    });
}

export const createStripeCustomers = async(customers) => {
    const createStripeCustomer = httpsCallable(functions, 'createStripeCustomer')
    const promises = []
    customers.forEach((customer, i) => {
        if (!customer.stripeID) {
            delay(i*20).then(() => {
                promises.push(createStripeCustomer({customer: customer, stripeAccount: "acct_1OKBGsQg1HhjFPji"}))
            })
        }    
    })
    return Promise.all(promises)
}

export const attachStripeIDtoLogs = async(customers) => {
    const start = Timestamp.fromDate(new Date(Date.parse("2023-010-21")))
    const q = query(collection(db, `organizations/Snowline/service_logs`), where("timestamp", ">", start));
    const querySnapshot = await getDocs(q);
    let count = 0
    querySnapshot.forEach((doc, i) => {
        count ++
        let entry = {...doc.data(), id: doc.id}
        const customer = customers.find(i => i.id === entry.cust_id)
        if (customer && !entry.stripeID) {
            sendToDB({...entry, stripeID: customer.stripeID}, `organizations/Snowline/service_logs`)
        }
    });
    console.log(count)
}


const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }