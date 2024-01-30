import React, { lazy, Suspense } from "react";
import { Modal, Button } from "react-bootstrap";

interface IDataImport {
  show: boolean,
  onClose: () => void,
  org: string
}

const FileUpload = lazy(() => import('./FileUpload'))

const DataImport = ({ show, onClose, org }: IDataImport) => {
  

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header>
        <Modal.Title>Import Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <p>To ensure a trouble-free upload, first download each template, 
        put in your data, then upload it using the form below.</p>
        <p>Important: If you have more than 500 customers, split them into multiple CSV files and upload them separately. The upload will fail if more than 500 customers are uploaded at once.</p>
      <hr />
        <h4>Customers:</h4>
        <Suspense fallback={<div>Loading...</div>}>
          <FileUpload 
              org={org}
              templateUrl="https://firebasestorage.googleapis.com/v0/b/route-manager-5f65b.appspot.com/o/public%2Fcustomer-upload-template.csv?alt=media&token=7c73c359-a4b2-44c5-8005-90d1fcbb1096&_gl=1*fqv76w*_ga*MTg5OTA4OTA1MC4xNjcyMDg2MDY4*_ga_CW55HF8NVT*MTY5OTIyNDAwNi40MTguMS4xNjk5MjI3MTQzLjE5LjAuMA.."
          /> 
        </Suspense>
        <hr />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default DataImport;
