import { addDoc, setDoc, collection, doc, getDocs, getDoc, Timestamp, WithFieldValue, DocumentData } from "firebase/firestore"
import { db } from "../../firebase"
import { ICustomerFieldsBefore, ICustomerFieldsAfter, ILogsFieldsBefore, ILogsFieldsAfter } from "./definitions"
import {httpsCallable, functions} from '../../firebase'

export const writeArrayToDocs = async(list: Array<ILogsFieldsBefore | ICustomerFieldsBefore>, path: string) => {
    let promises: Array<Promise<string>> = []
    //let fixedArray: Array<Object> = []
    list.forEach(item => {
        const fixedItem = path.endsWith('customer') ? recastCustomerValues(item) : recastLogValues(item)
        promises.push(writeNewItem(fixedItem, path)) 
    })
    return Promise.all(promises)
    .then(() => {
        //maybe here we call the function, and it queries all service logs so it gets the ids of the logs
        if (path.endsWith('service_logs')) {
            const connectLogsToCust = httpsCallable(functions, 'connectLogsToCust')
            connectLogsToCust()
            .then(res => console.log(res))
            .catch(err => alert(err))
        }
        return ('Upload Complete')
    } )
    .catch((e) => alert(e))
}

export const writeNewItem = <T extends WithFieldValue<DocumentData>>(item: T, path: string) : Promise<string> => {
    return new Promise((resolve, reject) => {
        addDoc(collection(db, path), item).then((item) => {
            resolve('customer uploaded')
        })
        .catch(() => reject(new Error('error uploading customer')))
    })
}

const recastCustomerValues = (customer: ICustomerFieldsBefore): ICustomerFieldsAfter => {
    const changedFields = {
        include_email2: customer.include_email2 === "true" || false,
        service_level: Number(customer.service_level) || 0,
        price_per_yard: Number(customer.price_per_yard) || 0,
        sweep_price: Number(customer.sweep_price) || 0,
        value: Number(customer.value) || 0,
        snow_price: Number(customer.snow_price) || 0,
        routesAssigned: {},
    }
    return {...customer, ...changedFields}
}

const recastLogValues = (logEntry: ILogsFieldsBefore): ILogsFieldsAfter => {
    const changedFields = {
        include_email2: logEntry.include_email2 === "true" || false,
        value: Number(logEntry.value) || 0,
        price_per_yard: Number(logEntry.price_per_yard) || 0,
        service_level: Number(logEntry.service_level) || 0,
        sweep_price: Number(logEntry.sweep_price) || 0,
        snow_price: Number(logEntry.snow_price) || 0,
        timestamp: Timestamp.fromDate(new Date(logEntry.timestamp || Date.now())),
        startTime: logEntry.startTime ? Timestamp.fromDate(new Date(logEntry.startTime)) : null,
        endTime: logEntry.endTime ? Timestamp.fromDate(new Date(logEntry.endTime)) : null,
    }
    return {...logEntry, ...changedFields}
}