
import React, { ChangeEvent, useState, MouseEvent } from "react"
import { Spinner, Button } from "react-bootstrap"
import Papa, {parse} from 'papaparse'
import { ParseResult, LocalFile } from "papaparse"
import { writeArrayToDocs } from "./utils"
import { ICustomerFieldsBefore, ILogsFieldsBefore } from "./definitions"
import ButtonWithLoading from "../buttons/ButtonWithLoading"

interface IFileUploadProps {
    org: string  
    collection: string
    templateUrl: string
}

const FileUpload = ({org, collection, templateUrl}: IFileUploadProps) => {
    const [isLoading, setIsLoading] = useState(false) 
    const [isDone, setIsDone] = useState(false)
    const [isDisabled, setIsDisabled] = useState(false)
    const [file, setFile] = useState<LocalFile>()

    const handleSubmit = (e:React.MouseEvent) => {        
        if (file !== undefined) {
            setIsLoading(true)
            parse(file , papaConfig)
        } else {
            alert('Please upload file first!')
        }
    }

    const writeData = async(data: ICustomerFieldsBefore[] | ILogsFieldsBefore[], path: string) => {
        await writeArrayToDocs(data, path)
        setIsLoading(false)
        setIsDone(true)
        setIsDisabled(true)
    }   

    const papaConfig = {
        header: true,
        complete: (results : ParseResult<ICustomerFieldsBefore>) => {   
            writeData(results.data, `organizations/${org}/${collection}`)  
        } ,
        skipEmptyLines: true,
        delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
    }

    const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.files?.[0])
        setFile(e.target.files?.[0])
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
                    tooltip="upload file"
                    isLoading={isLoading}
                    handleClick={(e: MouseEvent) => handleSubmit(e)}
                    disabled={isDisabled}
                    buttonText="Upload"
                />
                    
            </form>
        </div>
    )
}

export default FileUpload   