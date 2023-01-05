
import React, { ChangeEvent, useState } from "react"
import { Modal } from "react-bootstrap"
import Papa, {parse} from 'papaparse'
import { ParseResult, LocalFile } from "papaparse"
import { writeArrayToDocs } from "./utils"
import { ICustomerFieldsBefore } from "./definitions"

interface IFileUploadProps {
    show: boolean
    onHide: () => void
    org: string  
}

const FileUpload = ({show, onHide, org}: IFileUploadProps) => {
    const [file, setFile] = useState<LocalFile>()

    const handleSubmit = (e:React.MouseEvent) => {
        e.preventDefault()
        if (file !== undefined) {
            console.log(file)
            parse(file , papaConfig)
                     
        } else {
            alert('Please upload file first!')
        }
    }

    const papaConfig = {
        header: true,
        complete: (results : ParseResult<ICustomerFieldsBefore>) => {
            writeArrayToDocs(results.data, `organizations/${org}/customer`)
        } ,
        skipEmptyLines: true,
        delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
    }

    const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.files?.[0])
        setFile(e.target.files?.[0])
    }

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header>
                Upload customer data here
            </Modal.Header>
            <form>
                <input id='file-uploader' 
                    type='file' 
                    accept=".csv" 
                    onChange={handleSelect} />
                <button type='submit' onClick={e => handleSubmit(e)}>Upload</button>
            </form>
        </Modal>
    )
}

export default FileUpload   