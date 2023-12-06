
import React, { ChangeEvent, useState, MouseEvent, useEffect } from "react"
import { useSelector } from "react-redux"
import { Spinner, Button, Form } from "react-bootstrap"
import Papa, {parse} from 'papaparse'
import { ParseResult, LocalFile } from "papaparse"
import { writeCustomersToDocs } from "./utils"
import { ICustomerFieldsBefore, ILogsFieldsBefore } from "./definitions"
import ButtonWithLoading from "../buttons/ButtonWithLoading"

interface IFileUploadProps {
    org: string  
    collection: string
    templateUrl: string
}

const FileUpload = ({org, collection, templateUrl}: IFileUploadProps) => {
    const allCustomers = useSelector((state: any) => state.getAllCustomers.customers)
    const [isLoading, setIsLoading] = useState(false) 
    const [isDone, setIsDone] = useState(false)
    const [isDisabled, setIsDisabled] = useState(false)
    const [file, setFile] = useState<LocalFile>()
    const [duplicates, setDuplicates] = useState<ICustomerFieldsBefore[]>([])
    const [customers, setCustomers] = useState<ICustomerFieldsBefore[]>([])

    const papaConfig = {
        header: true,
        complete: (results : ParseResult<ICustomerFieldsBefore>) => {   
            setCustomers(results.data)
            // writeData(results.data, `organizations/${org}/${collection}`)  
        } ,
        skipEmptyLines: true,
        delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
    }

    useEffect(() => {
        console.log([...customers, ...allCustomers])
        const addressCount:Record<string, number> = {};
        const duplicates: ICustomerFieldsBefore[] = [];
    
        // Count the occurrences of each bill_address
        [...customers, ...allCustomers].forEach(customer => {
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
                const customer = customers.find(customer => customer.bill_address === address);
                if (customer) {
                    duplicates.push(customer);
                }
            }
        })
        setDuplicates(duplicates)
    }, [customers, allCustomers])

    const handleSubmit = (e:React.MouseEvent) => {        
        if (file !== undefined) {
            parse(file, papaConfig)
        } else {
            alert('Please upload file first!')
        }
    }

    const writeData = async(data: ICustomerFieldsBefore[] | ILogsFieldsBefore[], path: string) => {
        console.log(data)
        await writeCustomersToDocs(data, org)
        setIsLoading(false)
        setIsDone(true)
        setIsDisabled(true)
    }

    const setCustomerArrays = (results: ICustomerFieldsBefore[]) => {
        console.log(results)
        setCustomers(results)
        const addressCount:Record<string, number> = {};
        const duplicates: ICustomerFieldsBefore[] = [];
    
        // Count the occurrences of each bill_address
        customers.forEach(customer => {
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
                const customer = customers.find(customer => customer.bill_address === address);
                if (customer) {
                    duplicates.push(customer);
                }
            }
        })
        setDuplicates(duplicates)
    }

    const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.files?.[0])
        setFile(e.target.files?.[0])
    }

    const handleSelectCombineInvoices = (e: ChangeEvent<HTMLInputElement>, customer: ICustomerFieldsBefore) => {
        // iterate through all customers and any whose bill_address matches the selected customer's bill_address,
        // set combineInvoice to e.target.checked
        const updatedCustomers = customers.map((c) => {
            if (c.bill_address === customer.bill_address) {
                return {...c, combineInvoice: e.target.checked}
            } else {
                return c
            }
        })
        setCustomers(updatedCustomers)
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
                        Leave the box unchecked to invoice each service location separately. Once you have made your selections, click the "Write to Firestore" button to save your changes.
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
            {customers.length > 0 &&
                <ButtonWithLoading
                    tooltip="Save imported customers to the database"
                    isLoading={isLoading}
                    handleClick={(e: MouseEvent) => writeData(customers, `organizations/${org}/${collection}`)}
                    disabled={isDisabled}
                    buttonText="Upload Customers"
                />} 
            {isDone && <p>Upload complete!</p>}
        </div>
    )
}

export default FileUpload   