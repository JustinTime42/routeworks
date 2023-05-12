import _ from 'lodash'
import { setDoc, collection, doc, getDocs, Timestamp, where, query } from "firebase/firestore";
import { db } from "../../firebase";

export const getDiff = (entry) => {
    console.log("entry: ", entry)
    let diff = {}
    if (entry.deleted) {diff = entry}
    else if (!entry.after) {
        diff.deleted = entry.before 
    } else if (!entry.before) {
        diff.created = entry.after
    } else {
        const beforeKeys = Object.keys(entry.before)
        const afterKeys = Object.keys(entry.after)
        beforeKeys.forEach(key => {
            if( !_.isEqual(entry.before[key], entry.after[key])) {
                diff[key] = {before: entry.before[key], after: entry.after[key]}
            } 
        })
        afterKeys.forEach(key => {
            if((!_.isEqual(entry.after[key], entry.before[key])) && !diff[key]) {
                diff[key] = {before: entry.before[key], after: entry.after[key]}
            } 
        })
    }
    diff.service_address = entry.after?.service_address || entry.before?.service_address || entry.deleted?.service_address
    diff.changeTime = entry.timestamp
    diff.cust_id = entry.cust_id
    diff.id = entry.id
    return diff
}

export const sendToDB = async(item, path) => {
    let {id, ...newItem} = item
    console.log(newItem)
    console.log(id)
    await setDoc(doc(db, path, id), {...newItem}, { merge: true }) 
    //addedDocs.push(id)         
}

export const getBadChanges = async() => {
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
        let entry = {...doc.data(), id: doc.id}
        const {routesAssigned, service_address, timestamp, cust_id, id, ...change} = getDiff(entry) 
        if (Object.keys(change).length > 0) {
            changes.push(entry)
        }
    })
    console.log(changes)
    return changes
    
    // NOPE: forget trying to revert the routesAssigned field. just run a separate thing to go through and fix all routes
    // assigned issues. Go through each route, and each customer on the route, check that their routesAssigned[routeID], else add it. 
    // then go through all customers, check routesAssigned for routes that don't exist and delete them
    // Then run this deal and iterate through changes and check for fields other than routesAssigned, service_address, timestamp, cust_id, and id
    // use ...rest !== {}
    // If ...rest !== {} then push those changes to a list for us to go over
    // perhaps make a quick UI component where we can revert at button press, or manually edit inline rather than opening
    // the customer separately

}
