import React, { lazy, Suspense } from "react";
import { Modal, Button } from "react-bootstrap";

interface IDataImport {
  show: boolean,
  onClose: () => void,
  org: string
}
const DataImport = ({ show, onClose, org }: IDataImport) => {
  const FileUpload = lazy(() => import('./FileUpload'))

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header>
        <Modal.Title>Import Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <p>To ensure a trouble-free upload, first download each template, 
        put in your data, then upload it using the form below.</p>
        <p>Import Customers first. Service logs will then automatically match to the newly imported customers by name and service address. </p>
      <hr />
        <h4>Customers:</h4>
        <Suspense fallback={<div>Loading...</div>}>
          <FileUpload 
              org={org}
              collection={'customer'}
              templateUrl="https://firebasestorage.googleapis.com/v0/b/route-manager-5f65b.appspot.com/o/public%2Fcustomer-upload-template.csv?alt=media&token=2e71e084-9f99-4007-a315-60ca08b97c08"
          /> 
        </Suspense>
        <hr />
        <h4>Service Logs:</h4>
        <Suspense fallback={<div>Loading...</div>}>
          <FileUpload 
              org={org}
              collection={'service_logs'}
              templateUrl="https://firebasestorage.googleapis.com/v0/b/route-manager-5f65b.appspot.com/o/public%2Fservice-logs-template.csv?alt=media&token=2a7c2273-d564-44b4-b0d4-920e0dc7e241"
          /> 
        </Suspense>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default DataImport;

// during service logs import, if no customer found matching name and address, create a new customer. 
// it'd be really hard to go the other way, matching a customer with existing service logs without querying the entire
// service logs for each customer. 