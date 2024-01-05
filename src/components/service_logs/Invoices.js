import React, { useState, useEffect} from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../firebase'
import ButtonWithLoading from '../buttons/ButtonWithLoading'

const Invoices = ({show, setShow}) => {
  const [invoices, setInvoices] = useState([])
  const [dueDate, setDueDate] = useState('')
  const [selected, setSelected] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAllSelected, setIsAllSelected] = useState(true)

  const handleSetDueDate = (value) => {
    const offset = new Date().getTimezoneOffset() * 60000
    const date = (Date.parse(value) + offset  ) / 1000
    console.log(date)
    setDueDate(date)
  }

  useEffect(() => {
    if (show) {  
      setIsLoading(true)    
      const getPendingBalances = httpsCallable(functions, 'getPendingBalances')
      getPendingBalances().then(result => {
        console.log(result.data)
        setInvoices(result.data)
        setSelected(result.data.map(i => i.stripeID))
        setIsLoading(false)
      })
    }
  }, [show])  

  const handleSendInvoices = () => {
    setIsLoading(true)
    const sendInvoices = httpsCallable(functions, 'sendInvoices')
    sendInvoices({customers: selected, dueDate: dueDate})
    .then(result => {
      console.log(result)
      setIsLoading(false)
    })
    .catch(error => {
      alert(error)
      setIsLoading(false)
    })
  }

  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Invoices</Modal.Title>
      </Modal.Header>
      <Modal.Body>  
        <Form.Group>
          <Form.Check
            type="checkbox"
            name="all"
            label="Select All"
            checked={isAllSelected}
            onChange={event => {
              if (event.target.checked) {
                setSelected(invoices.map(i => i.stripeID))
                setIsAllSelected(true)
              } else {
                setSelected([])
                setIsAllSelected(false)
              }
            }}
          />
        </Form.Group>
        {invoices.filter(i => i.email).sort((a,b) => a.cust_name.localeCompare(b.cust_name)).map(i => {
          return (
            <Form.Group key={i.stripeID}>
              <Form.Check
                type="checkbox"
                name={i.stripeID}
                label={`${i.cust_name} - ${i.bill_address} - $${i.balance / 100}`}
                checked={selected.includes(i.stripeID)}
                onChange={event => {
                  if (event.target.checked) {
                    setSelected([...selected, event.target.name])
                  } else {
                    setSelected(selected.filter(s => s !== event.target.name))
                  }
                }}
              />
            </Form.Group>
          ) 
        })}
      </Modal.Body>
      <Modal.Footer>
      <Form.Group style={{display: "flex", flexWrap: "wrap", gap:"5px", alignItems:"baseline"}}>
        <Form.Label>Due Date:</Form.Label>
        <Form.Control style={{width: "200px"}} name="invoiceDate" type="date" onChange={event => handleSetDueDate(event.target.value)}/>
        <ButtonWithLoading
          variant="primary"
          handleClick={handleSendInvoices}
          isLoading={isLoading}
          buttonText="Send Invoices"
          tooltip="Send invoices to selected customers."
        />
        <Button variant="secondary" onClick={() => setShow(false)}>
          Close
        </Button>
      </Form.Group>
        </Modal.Footer>
    </Modal>
  )
}

export default Invoices
