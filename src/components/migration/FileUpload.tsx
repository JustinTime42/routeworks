
import React, { ChangeEvent, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {hideModal, showModal} from "../../actions"
import { Modal, Spinner, Button } from "react-bootstrap"
import Papa, {parse} from 'papaparse'
import { ParseResult, LocalFile } from "papaparse"
import { writeArrayToDocs } from "./utils"
import { ICustomerFieldsBefore } from "./definitions"

interface IFileUploadProps {
    show: boolean
    onClose: (whichModal: string) => void
    org: string  
    collection: string
    test:any
}

const FileUpload = ({show, onClose, org, collection, test}: IFileUploadProps) => {
    const [isLoading, setIsLoading] = useState(false) 
    const [isDone, setIsDone] = useState(false)
    const [isDisabled, setIsDisabled] = useState(false)
    const [file, setFile] = useState<LocalFile>()
    const dispatch = useDispatch()

    const handleSubmit = (e:React.MouseEvent) => {        
        if (file !== undefined) {
            setIsLoading(true)
            parse(file , papaConfig)
                     
        } else {
            alert('Please upload file first!')
        }
    }

    const writeCustomers = async(data: ICustomerFieldsBefore[], path: string) => {        
        await writeArrayToDocs(data, path)
        setIsLoading(false)
        setIsDone(true)
        setIsDisabled(true)
    }   

    const papaConfig = {
        header: true,
        complete: (results : ParseResult<ICustomerFieldsBefore>) => {   
            writeCustomers(results.data, `organizations/${org}/${collection}`)  
        } ,
        skipEmptyLines: true,
        delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
    }

    const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.files?.[0])
        setFile(e.target.files?.[0])
    }

    const handleClose = () => {
        dispatch(hideModal('File Upload'))
        setIsDone(false)
        setIsDisabled(false)
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header>
                Upload customer data here.
            </Modal.Header>
            <Modal.Body>
                <form>
                    <input id='file-uploader' 
                        type='file' 
                        accept=".csv" 
                        onChange={handleSelect} />
                    <Button
                        variant='primary' 
                        type='button' 
                        onClick={e => handleSubmit(e)}
                        disabled={isDisabled}
                        >
                        { isLoading ? <Spinner size='sm' animation="border" /> : null }
                        { isDone ? 'Done!' : 'Upload'}                        
                    </Button>                    
                </form>
            </Modal.Body>  
            <Modal.Footer>
                <Button variant="primary" onClick={handleClose}>Close</Button>
            </Modal.Footer>          
        </Modal>
    )
}

export default FileUpload   