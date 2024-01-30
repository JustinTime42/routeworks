
import React, { ChangeEvent, useState, MouseEvent, useEffect } from "react"
import { Spinner, Button, Form } from "react-bootstrap"
import Papa, {parse} from 'papaparse'
import { ParseResult, LocalFile } from "papaparse"
import { recastCustomerValues, writeCustomersToDocs } from "./utils"
import { ICustomerFieldsAfter, ICustomerFieldsBefore, ILogsFieldsBefore } from "./definitions"
import ButtonWithLoading from "../buttons/ButtonWithLoading"    
import { getCustFields, getLocationFields } from "../utils"
import { DocumentData, addDoc, collection, doc, getDocs, writeBatch } from "firebase/firestore"
import { db } from "../../firebase"
import AsyncActionButton from "../buttons/AsyncActionButton"

interface IFileUploadProps {
    org: string  
    templateUrl: string
}

const FileUpload = ({org, templateUrl}: IFileUploadProps) => {
    const [file, setFile] = useState<LocalFile | undefined>(undefined)
    const [duplicates, setDuplicates] = useState<ICustomerFieldsBefore[]>([])
    const [customersFromCsv, setCustomersFromCsv] = useState<ICustomerFieldsBefore[]>([])
    const [custsToCombine, setCustsToCombine] = useState<Record<string, string>>({})
    const [allCustomers, setAllCustomers] = useState<any[]>([])

    const papaConfig = {
        header: true,
        complete: (results: ParseResult<ICustomerFieldsBefore>) => {
            return fetchCustomers().then((customers) => {
                console.log(results.data)
                const addressCount:Record<string, number> = {};
                const duplicates: ICustomerFieldsBefore[] = [];
                if (!customers) return
                // Count the occurrences of each bill_address
                [...results.data, ...customers].forEach(customer => {
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
                return
            }).catch(err => {throw new Error(err)})
        },
        skipEmptyLines: true,
        delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
    }

    const fetchCustomers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, `organizations/${org}/customers`));

            const customers:any = []
            querySnapshot.docs.forEach((doc) => {customers.push({...doc.data(), id: doc.id})});
            setAllCustomers(customers);
            console.log(customers)
            return customers;
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const handleSubmit = async() => {        
        if (file !== undefined) {
            await parse(file, papaConfig)
        } else {
            alert('Please upload file first!')
        }
    }

    const writeData = async () => {
        const batch = writeBatch(db);
        const existingCustomers = [...allCustomers];

        for (const customer of customersFromCsv) {
            const fixedCustomer = getCustFields(recastCustomerValues(customer));
            const fixedLocation = getLocationFields(recastCustomerValues(customer));

            if (custsToCombine[customer.bill_address] === undefined) {
                // Not a customer to combine
                const newCustRef = doc(collection(db, `organizations/${org}/customers`));
                const newLocationRef = doc(collection(db, `organizations/${org}/service_locations`));

                batch.set(newCustRef, fixedCustomer);
                batch.set(newLocationRef, { ...fixedLocation, cust_id: newCustRef.id });
            } else {
                if (custsToCombine[customer.bill_address] === "") {
                    // Customer to combine, but not preexisting in the database
                    const existingCustomer = existingCustomers.find(
                        (i) => i.bill_address === customer.bill_address
                    );

                    if (existingCustomer) {
                        // Write new service location with cust_id of existingCustomer
                        const newLocationRef = doc(
                            collection(db, `organizations/${org}/service_locations`)
                        );
                        batch.set(newLocationRef, {
                            ...fixedLocation,
                            cust_id: existingCustomer.id,
                        });
                    } else {
                        // Write new customer, new service location
                        const newCustRef = doc(collection(db, `organizations/${org}/customers`));
                        const newLocationRef = doc(
                            collection(db, `organizations/${org}/service_locations`)
                        );

                        batch.set(newCustRef, fixedCustomer);
                        batch.set(newLocationRef, {
                            ...fixedLocation,
                            cust_id: newCustRef.id,
                        });

                        existingCustomers.push({ ...customer, id: newCustRef.id });
                    }
                } else {
                    // Customer to combine, and preexisting in the database
                    const newLocationRef = doc(
                        collection(db, `organizations/${org}/service_locations`)
                    );
                    batch.set(newLocationRef, {
                        ...fixedLocation,
                        cust_id: custsToCombine[customer.bill_address],
                    });
                }
            }
        }

        try {
            await batch.commit();
            setCustsToCombine({});
            setDuplicates([]);
            setFile(undefined);
        } catch (error) {
            throw new Error(String(error));
        }
    };

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
            <Form>
                <Form.Group>
                    <Form.Label>File Upload</Form.Label>
                    <Form.Control type="file" onChange={handleSelect} accept=".csv" />
                </Form.Group>
                {file && !customersFromCsv.length &&              
                    <AsyncActionButton
                        asyncAction={handleSubmit}
                        label={"Import File"}
                        />}     
            </Form>
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
            <>
                <p>Success! <br/> Your file looks good. Press 'Upload Customers' below to save them to your company database. <br /> This may take a few minutes.</p>
                <AsyncActionButton
                    asyncAction={writeData}
                    label={"Upload Customers"}
                />
            </>

                } 
        </div>
    )
}

export default FileUpload   