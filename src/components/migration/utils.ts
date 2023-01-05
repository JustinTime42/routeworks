import { addDoc, setDoc, collection, doc, getDocs, getDoc, Timestamp } from "firebase/firestore"
import { db } from "../../firebase"
import { ICustomerFieldsBefore, ICustomerFieldsAfter } from "./definitions"

export const writeArrayToDocs = async(list: Array<ICustomerFieldsBefore>, path: string) => {
    list.forEach(item => {
        const fixedItem = recastCustomerNumbers(item)
        writeNewItem(fixedItem, path)
    })
}

export const writeNewItem = async(item: object, path: string) => {
    try {        
        await addDoc(collection(db, path), item)
        console.log(item)
    }
    catch(error) {
        alert('error updating database' + error)
    }              
}

const recastCustomerNumbers = (customer: ICustomerFieldsBefore): ICustomerFieldsAfter => {
    const changedFields = {
        include_email2: customer.include_email2 === "true",
        service_level: Number(customer.service_level),
        price_per_yard: Number(customer.price_per_yard),
        sweep_price: Number(customer.sweep_price),
        value: Number(customer.value),
        snow_price: Number(customer.snow_price),
        routesAssigned: {},
    }
    return {...customer, ...changedFields}
}