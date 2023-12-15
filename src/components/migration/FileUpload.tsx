
import React, { ChangeEvent, useState, MouseEvent, useEffect } from "react"
import { useSelector } from "react-redux"
import { Spinner, Button, Form } from "react-bootstrap"
import Papa, {parse} from 'papaparse'
import { ParseResult, LocalFile } from "papaparse"
import { recastCustomerValues, writeCustomersToDocs } from "./utils"
import { ICustomerFieldsBefore, ILogsFieldsBefore } from "./definitions"
import ButtonWithLoading from "../buttons/ButtonWithLoading"
import { getCustFields, getLocationFields } from "../utils"
import { DocumentData, addDoc, collection } from "firebase/firestore"
import { db } from "../../firebase"

interface IFileUploadProps {
    org: string  
    templateUrl: string
}

const FileUpload = ({org, templateUrl}: IFileUploadProps) => {
    const allCustomers = useSelector((state: any) => state.getAllCustomers.customers)
    // const allServiceLocations = useSelector((state: any) => state.requestAllAddresses.addresses) 
    const [isLoading, setIsLoading] = useState(false) 
    const [isDone, setIsDone] = useState(false)
    const [isDisabled, setIsDisabled] = useState(false)
    const [file, setFile] = useState<LocalFile>()
    const [duplicates, setDuplicates] = useState<ICustomerFieldsBefore[]>([])
    const [customersFromCsv, setCustomersFromCsv] = useState<ICustomerFieldsBefore[]>([])
    const [custsToCombine, setCustsToCombine] = useState<Record<string, string>>({})

    const papaConfig = {
        header: true,
        complete: (results: ParseResult<ICustomerFieldsBefore>) => {
            // Step 1: Merge allCustomers and allServiceLocations on customer.id === serviceLocation.cust_id
            // const allMergedLocations = allServiceLocations.map((serviceLocation: any) => {
            //     const customer = allCustomers.find((customer: any) => customer.id === serviceLocation.cust_id)
            //     return {...serviceLocation, ...customer}
            // })

            // // Step 2: Find results from above that are also located in results.data based on matching bill_address
            // const existingLocationsInImport = allMergedLocations.filter((mergedItem: any) => {
            //     return results.data.some((result: any) => result.bill_address === mergedItem.bill_address)
            // })
            console.log(results.data)
            const addressCount:Record<string, number> = {};
            const duplicates: ICustomerFieldsBefore[] = [];
        
            // Count the occurrences of each bill_address
            [...results.data, ...allCustomers].forEach(customer => {
                const address = customer.bill_address;
                if (addressCount[address]) {
                    addressCount[address]++;
                } else {
                    addressCount[address] = 1;
                }
            });
            // Find customers with duplicated bill_address
            Object.keys(addressCount).forEach(address => {
                if (addressCount[address] > 1) {
                    const customer = results.data.find(customer => customer.bill_address === address);
                    if (customer) {
                        duplicates.push(customer);
                    }
                }
            })
            setDuplicates(duplicates)

            setCustomersFromCsv(results.data);
            // writeData(results.data, `organizations/${org}/${collection}`)
        },
        skipEmptyLines: true,
        delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
    }

    useEffect(() => {
        console.log(duplicates)
    },[duplicates])
    //function or useEffect to see if any customers from allCustomers already
    // exist in customers. If so, add them to the customers array
    // useEffect(() => {
    //     setCustomers((currentCustomers) => {
    //         const newCustomers = allCustomers.filter((customer: ICustomerFieldsBefore) => {
    //             return currentCustomers.some((c: ICustomerFieldsBefore) => c.bill_address === customer.bill_address)
    //         })
    //         return [...currentCustomers, ...newCustomers]
    //     })
    // }, [allCustomers])

    // useEffect(() => {
    //     const addressCount:Record<string, number> = {};
    //     const duplicates: ICustomerFieldsBefore[] = [];
    
    //     // Count the occurrences of each bill_address
    //     [...customersFromCsv, ...allCustomers].forEach(customer => {
    //         const address = customer.bill_address;
    //         if (addressCount[address]) {
    //             addressCount[address]++;
    //         } else {
    //             addressCount[address] = 1;
    //         }
    //     });
    //     // Find customers with duplicated bill_address
    //     Object.keys(addressCount).forEach(address => {
    //         if (addressCount[address] > 1) {
    //             const customer = customersFromCsv.find(customer => customer.bill_address === address);
    //             if (customer) {
    //                 duplicates.push(customer);
    //             }
    //         }
    //     })
    //     setDuplicates(duplicates)
    // }, [customersFromCsv, allCustomers])

    const handleSubmit = (e:React.MouseEvent) => {        
        if (file !== undefined) {
            parse(file, papaConfig)
        } else {
            alert('Please upload file first!')
        }
    }

    const writeData = async() => {
        const promises: Array<Promise<DocumentData>> = []
        const existingCustomers = [...allCustomers]
        for (const customer of customersFromCsv) {
            const fixedCustomer = getCustFields(recastCustomerValues(customer))
            const fixedLocation = getLocationFields(recastCustomerValues(customer))
            if (custsToCombine[customer.bill_address] === undefined) { // this condition means it is not a customer to combine
                const newCust = await addDoc(collection(db, `organizations/${org}/customers`), fixedCustomer)
                promises.push(addDoc(collection(db, `organizations/${org}/service_locations`), {...fixedLocation, cust_id: newCust.id}))
            } else {
                if (custsToCombine[customer.bill_address] === "") { // this condition means it is a customer to combine, but not preexisting in the database (no id)
                    // look in existingCustomers for customer with same bill_address, write new service location
                    const existingCustomer = existingCustomers.find(i => i.bill_address === customer.bill_address)
                    if (existingCustomer) {
                        // write new service location with cust_id of existingCustomer
                        promises.push(addDoc(collection(db, `organizations/${org}/service_locations`), {...fixedLocation, cust_id: existingCustomer.id}))
                    } else {
                        // write new customer, new service location
                        const newCust = await addDoc(collection(db, `organizations/${org}/customers`), fixedCustomer)
                        promises.push(addDoc(collection(db, `organizations/${org}/service_locations`), {...fixedLocation, cust_id: newCust.id}))
                        existingCustomers.push({...customer, id: newCust.id})
                    }
                }
                else { // this condition means it is a customer to combine, and preexisting in the database (has id)
                    // write new service location with cust_id of custsToCombine[customer.bill_address]
                    promises.push(addDoc(collection(db, `organizations/${org}/service_locations`), {...fixedLocation, cust_id: custsToCombine[customer.bill_address]}))
                }
            }
        }
        Promise.all(promises).then(res => {
            setIsLoading(false)
            setIsDone(true)
            setIsDisabled(true)
            console.log(res)
        })
    }

    const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.files?.[0])
        setFile(e.target.files?.[0])
    }

    const handleSelectCombineInvoices = (e: ChangeEvent<HTMLInputElement>, customer: ICustomerFieldsBefore) => {
        // iterate through all customers and any whose bill_address matches the selected customer's bill_address,
        // set combineInvoice to e.target.checked
        // const toCombine = customersFromCsv.map((c) => {
        //     if (c.bill_address === customer.bill_address) {
        //         return {...c, combineInvoice: e.target.checked}
        //     } else {
        //         return c
        //     }
        // })
        if (e.target.checked) {
            setCustsToCombine(custsToCombine => {
                return {...custsToCombine, [customer.bill_address]: customer.cust_id || ""}
            })
        } else {
            setCustsToCombine(custsToCombine => {
                const newCustsToCombine = {...custsToCombine}
                delete newCustsToCombine[customer.bill_address]
                return newCustsToCombine
            })
        }
    }

    return (
        <div>
            <a href={templateUrl}>Template Download</a>            
            <form>
                <input id='file-uploader' 
                    type='file' 
                    accept=".csv" 
                    onChange={handleSelect} />
                <ButtonWithLoading
                    tooltip="Import file"
                    isLoading={isLoading}
                    handleClick={(e: MouseEvent) => handleSubmit(e)}
                    disabled={isDisabled}
                    buttonText="Import"
                />                   
            </form>
            {duplicates.length > 0 &&
                <div>
                    <h4>Duplicates found:</h4>
                    <p>Listed below are customers that have more than one service location registered to the same billing address.
                        For each customer, please check the box if you would like to combine all service locations for that customer into one invoice.
                        Leave the box unchecked to invoice each service location separately. Once you have made your selections, click the "Upload Customers" button to save your changes.
                    </p>
                    <div style={{height: "30vh", overflow: "scroll"}}>
                        {duplicates.map((customer, index) => {
                            return (
                                <Form.Check 
                                    key={index}
                                    type="checkbox"
                                    id={`duplicate-${index}`}
                                    label={`${customer.cust_name} ${customer.bill_address}`}
                                    onChange={(e) => handleSelectCombineInvoices(e, customer)}
                                    >
                                </Form.Check>  
                            )                          
                        }
                        )}
                    </div>                    
                </div>
            }
            {customersFromCsv.length > 0 &&
                <ButtonWithLoading
                    tooltip="Save imported customers to the database"
                    isLoading={isLoading}
                    handleClick={writeData}
                    disabled={isDisabled}
                    buttonText="Upload Customers"
                />} 
            {isDone && <p>Upload complete!</p>}
        </div>
    )
}

export default FileUpload   