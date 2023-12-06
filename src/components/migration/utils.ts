import { addDoc, setDoc, collection, doc, getDocs, getDoc, Timestamp, WithFieldValue, DocumentData } from "firebase/firestore"
import { db } from "../../firebase"
import { ICustomerFieldsBefore, ICustomerFieldsAfter, ILogsFieldsBefore, ILogsFieldsAfter } from "./definitions"
import {httpsCallable, functions} from '../../firebase'
import { getCustFields, getLocationFields } from "../utils"

export const writeCustomersToDocs = async(list: Array<ILogsFieldsBefore | ICustomerFieldsBefore>, org: string) => {
    console.log(list)
    const combinedCustomers: Record<string, string> = {} // key is bill_address, value is cust_id
    let promises: Array<Promise<DocumentData>> = []
    //let fixedArray: Array<Object> = []
    list.forEach(async(item) => {
        const fixedCustomer = getCustFields(recastCustomerValues(item))
        const fixedLocation = getLocationFields(recastCustomerValues(item))
        console.log("fixedCustomer", fixedCustomer)
        console.log("fixedLocation", fixedLocation)
        if (fixedCustomer.combineInvoice) {
            const existingCust = combinedCustomers[fixedCustomer.bill_address]
            if (existingCust) { 
                // we don't need to write a new customer. We just need to write a new service_location and use the existing customer id
                promises.push(addDoc(collection(db, `organizations/${org}/service_locations`), {...fixedLocation, cust_id: existingCust}))
            } else {
                //write a new customer and then write a new service_location with that new cust_id                
                const newCust = await addDoc(collection(db, `organizations/${org}/customers`), fixedCustomer)
                combinedCustomers[fixedCustomer.bill_address] = newCust.id
                promises.push(addDoc(collection(db, `organizations/${org}/service_locations`), {...fixedLocation, cust_id: newCust.id}))
            }
        } else {
            const newDoc = await addDoc(collection(db, `organizations/${org}/customers`), fixedCustomer)
            console.log("added item: ", newDoc.id)
            promises.push(addDoc(collection(db, `organizations/${org}/service_locations`), {...fixedLocation, cust_id: newDoc.id}))
        }
    })
    return Promise.all(promises)
    .then(() => {
        //maybe here we call the function, and it queries all service logs so it gets the ids of the logs
        // if (path.endsWith('service_logs')) {
        //     const connectLogsToCust = httpsCallable(functions, 'connectLogsToCust')
        //     connectLogsToCust()
        //     .then(res => console.log("res", res))
        //     .catch(err => console.log(err))
        // }
        return ('Upload Complete')
    } )
    .catch((e) => alert(e))
}

export const writeNewItem = <T extends WithFieldValue<DocumentData>>(item: T, path: string) : Promise<string> => {
    return new Promise((resolve, reject) => {
        addDoc(collection(db, path), item).then((item) => {
            resolve(item.id)
        })
        .catch(() => reject(new Error('error uploading customer')))
    })
}

const recastCustomerValues = (customer: ICustomerFieldsBefore): ICustomerFieldsAfter => {
    const changedFields = {
        include_email2: customer.include_email2 === "true" || false,
        service_level: Number(customer.service_level) || 0,
        routesAssigned: {},
    }
    return {...customer, ...changedFields}
}

const recastLogValues = (logEntry: ILogsFieldsBefore): ILogsFieldsAfter => {
    const changedFields = {
        include_email2: logEntry.include_email2 === "true" || false,
        value: Number(logEntry.value) || 0,
        service_level: Number(logEntry.service_level) || 0,
        sweep_price: Number(logEntry.sweep_price) || 0,
        snow_price: Number(logEntry.snow_price) || 0,
        timestamp: Timestamp.fromDate(new Date(logEntry.timestamp || Date.now())),
        startTime: logEntry.startTime ? Timestamp.fromDate(new Date(logEntry.startTime)) : null,
        endTime: logEntry.endTime ? Timestamp.fromDate(new Date(logEntry.endTime)) : null,
    }
    return {...logEntry, ...changedFields}
}