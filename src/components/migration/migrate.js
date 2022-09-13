import { addDoc, setDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";

const sendToDB = async(item, path) => {
    console.log(item)
    try {
        const docRef = await addDoc(collection(db, path), {...item})  
        console.log(docRef)                   
   } catch (e) {
     alert("Error adding document: ", e);
   }
}

export const migrateCustomers = () => {
    fetch(`${process.env.REACT_APP_API_URL}/properties`)
    .then(response => response.json())
    .then(data => {
        console.log('customers from old database')
        console.log(data)
       // let newCustomerArray = []
        data.forEach(async(item) => {
        let newItem = {                   
                cust_name: item.cust_name,
                cust_fname: item.cust_fname,
                cust_lname: item.cust_lname,
                cust_phone: item.cust_phone,
                surface_type: item.surface_type,
                notes: item.notes,                   
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
                tags: item.tags.split(','),
                service_level: item.service_level,
                snow_price: item.price,
                sweep_price: item.sweep_price,
                value: item.value,
                price_per_yard: item.price_per_yard,
                season_price: item.season_price,
                contract_type: item.contract_type,
                sand_contract_type: item.sand_contract,
                Sander: item.Sander,
                date_created: item.date_created,
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
        keysArray.forEach(i => {
            if (newItem[i] === null || newItem[i] === undefined) {
                delete newItem[i]
            }
        }) 
        await setDoc(doc(db, "driver/driver_lists/customer", item.key), newItem);
    })
    } )
    .catch(error => alert(error))
}

//this will be for drivers, vehicles, vehicle_types, work_types
export const migrateBasic = (oldPath, newPath) => {
    fetch(`${process.env.REACT_APP_API_URL}/${oldPath}`)
    .then(response => response.json())
    .then(data => {
        console.log('data from old database')
        console.log(data)        
        data.forEach(item => {
            let {key, ...newItem} = item
            sendToDB(newItem, newPath)
        })
    })
    .catch(err => alert(err))
}


export const migrateRouteData = () => {
    fetch(`${process.env.REACT_APP_API_URL}/routelist`)
    .then(res => res.json())
    .then(data => {
        //now we have an array of routes, with name and key and active
        data.forEach(route => {
            newRouteObj = {
                name: route.name,
                active: route.active,
                customers: [] //get all customers here
            }
            fetch(`${process.env.REACT_APP_API_URL}/getroute/${route.name}`)
            .then(res => res.json())
            .then(data => {
                data.forEach(customer => {
                    let newCustomer = {
                        active: customer.active | false,
                        service_address: customer.address,
                        cust_name: customer.cust_name,
                        id: customer.property_key,
                        priority: customer.priority,
                        service_level: customer.service_level,
                        status: customer.status,
                        temporary: customer.temp || false,
                        new: customer.is_new || false,
                    }
                    newRouteObj.customers.push(customer)
                })
                //now we have all the customers on that route with 
                //property_key, route_name, route_position, status, key, priority, active, address, cust_name, cust_phone, surface_type, is_new, etc.
            })
            sendToDB(newRouteObj, 'driver/driver_lists/route')
           

        })
    })
    // yikes this will require a custom query endpoint to be made 
    // on heroku and then imported
    // we'll need to join the routes, route_data, and properties tables
    // no actually.. let's just grab the data and do it on the front end
    /* 
        get routes first - now we have an array
        routes.forEach(route => {

        })
    */
}

export const migrateTags = () => {
    fetch(`${process.env.REACT_APP_API_URL}/alltags`)
    .then(response => response.json())
    .then(async(data) => {
        console.log('tags from old database')
        console.log(data)
        await setDoc(doc(db, "driver", "tags"), data);
    })
    .catch(err => alert(err))
}

//
export const migrateLogs = () => {
    fetch(`${process.env.REACT_APP_API_URL}/getlogs?type=raw&start=2019-01-01&end=2023-01-01`)
    .then(response => response.json())
    .then(data => {
        console.log('logs from old database')
        console.log(data) 
        data.forEach(item => {
            item.service_address = item.address
            delete item.address
            sendToDB(item, 'service_logs')
        })
    })
    .catch(err => console.log(err))
}

