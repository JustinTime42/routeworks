export interface ICustomerFieldsBefore {
    cust_name: string
    cust_fname: string
    cust_lname: string
    cust_phone: string
    cust_email: string
    cust_email2: string
    include_email2: string
    service_address: string
    service_city: string
    service_state: string
    service_zip: string
    bill_address: string
    bill_city: string
    bill_state: string
    bill_zip: string
    service_level: string
    price_per_yard: string
    sweep_price: string
    value: string
    snow_price: string
    surface_type: string
    contract_type: string
    tags: string
    sand_contract: string
    notes: string
}

export interface ICustomerFieldsAfter {
    cust_name?: string
    cust_fname?: string
    cust_lname?: string
    cust_phone?: string
    cust_email?: string
    cust_email2?: string
    include_email2?: boolean
    service_address?: string
    service_city?: string
    service_state?: string
    service_zip?: string
    bill_address?: string
    bill_city?: string
    bill_state?: string
    bill_zip?: string
    service_level?: number
    price_per_yard?: number
    sweep_price?: number
    value?: number
    snow_price?: number
    surface_type?: string
    contract_type?: string
    tags?: string
    sand_contract?: string
    notes?: string
    routes_assigned?: object
}