import { Timestamp } from "firebase/firestore"

export interface ICommonFieldsBefore extends WithFieldValue<DocumentData> {
    service_address?: string
    cust_name?: string
    cust_email?: string 
    cust_email2?: string
    include_email2?: string
    bill_address: string
    bill_city?: string
    bill_state?: string
    bill_zip?: string
}

export interface ICommonFieldsAfter extends WithFieldValue<DocumentData> {
    service_address?: string
    cust_name?: string
    cust_email?: string
    cust_email2?: string
    include_email2?: boolean
    bill_address?: string
    bill_city?: string
    bill_state?: string
    bill_zip?: string
}

export interface ICustomerFieldsBefore extends ICommonFieldsBefore {    
    cust_fname?: string
    cust_lname?: string
    cust_phone?: string
    service_city?: string
    service_state?: string
    service_zip?: string
    service_level?: string
    surface_type?: string
    tags?: string
    notes?: string
    cust_id?: string
}

export interface ICustomerFieldsAfter extends ICommonFieldsAfter {
    cust_fname?: string
    cust_lname?: string
    cust_phone?: string
    service_city?: string
    service_state?: string
    service_zip?: string    
    service_level?: number
    surface_type?: string
    tags?: string
    notes?: string
    routes_assigned?: object
}

export interface ILogsFieldsBefore extends ICommonFieldsBefore {
    cust_fname?: string
    cust_lname?: string
    cust_phone?: string
    service_city?: string
    service_state?: string
    service_zip?: string
    service_level?: string
    sweep_price?: string
    value?: string
    snow_price?: string
    surface_type?: string
    tags?: string
    sand_contract?: string
    notes?: string
    timestamp?: Date
    startTime?: Date | null
    endTime?: Date | null
    cust_id?: string
}

export interface ILogsFieldsAfter extends ICommonFieldsAfter {
    cust_fname?: string
    cust_lname?: string
    cust_phone?: string
    service_city?: string
    service_state?: string
    service_zip?: string
    service_level?: number
    sweep_price?: number
    value?: number
    snow_price?: number
    surface_type?: string
    tags?: string
    sand_contract?: string
    notes?: string
    timestamp?: Timestamp
    startTime?: Timestamp | null
    endTime?: Timestamp | null
}