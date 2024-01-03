import React, { useState, useEffect } from 'react'
import { Button, Modal, Form, Card } from 'react-bootstrap'
import SearchableInput from '../components/SearchableInput'
import { useSelector, useDispatch } from 'react-redux'
import { editItem } from '../actions'
import ButtonWithLoading from '../components/buttons/ButtonWithLoading'
import { UPDATE_ADDRESSES_SUCCESS } from '../constants'

const TransferLocation = ({showTransfer, setShowTransfer, location}) => {
  const [selected, setSelected] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [matches, setMatches] = useState([])
  const customers = useSelector(state => state.getAllCustomers.customers)
  const {addresses, isPending, error} = useSelector(state => state.requestAllAddresses.addresses)
  const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
  const dispatch = useDispatch()

  const assignToCustomer = () => {
    const updatedLocation = { ...location, cust_id: selected.id };
    console.log(updatedLocation)
    dispatch(editItem(updatedLocation, addresses, `organizations/${organization}/service_locations`, null, UPDATE_ADDRESSES_SUCCESS))
    setShowTransfer(false)

  }

  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchTerm(value);
  };

  const handleCustomerClick = (custID) => {
    const selectedCustomer = customers.find((customer) => customer.id === custID)
    console.log(selectedCustomer)
    setSelected(selectedCustomer);
    setSearchTerm(selectedCustomer.cust_name)
  };

  useEffect(() => {
    console.log(searchTerm)
    if (searchTerm.length > 0) {
        const filteredCustomers = customers.filter((i) => {
            if(i.cust_name?.toLowerCase().includes(searchTerm?.toLowerCase())) return true
            else if(i.cust_phone?.toLowerCase().includes(searchTerm?.toLowerCase())) return true
            else if(i.cust_email?.toLowerCase().includes(searchTerm?.toLowerCase())) return true
            else if(i.bill_address?.toLowerCase().includes(searchTerm?.toLowerCase())) return true
            else return false
        })        
        setMatches(filteredCustomers)
    } else {
      setMatches([])
    }
  }, [searchTerm, customers, setMatches])

  return (
    <Modal show={showTransfer} onHide={() => setShowTransfer(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Transfer Location</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Transfer to Customer:</Form.Label>
                    <SearchableInput
                        className="mr-2"
                        name="searchTerm"
                        searchValue={searchTerm}
                        changeSearchValue={handleSearch}
                        matches={matches}
                        selectItem={handleCustomerClick}
                        handleBlur={() => setSearchTerm("")}
                    />
                </Form.Group>  
                <div className="d-flex mt-1">
                  <Card className="col-md-6">
                    <Card.Header>
                      <Card.Title>Transfer Location:</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <Card.Text>{location.service_address}</Card.Text>
                    </Card.Body>
                  </Card>   
                  <Card className="col-md-6">
                    <Card.Header>
                      <Card.Title>To Customer:</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <Card.Text>{selected.cust_name}</Card.Text>
                      <Card.Text>Billing Address:</Card.Text>
                      <Card.Text>{selected.bill_address}</Card.Text>
                      <Card.Text>{selected.cust_phone}</Card.Text>
                    </Card.Body>
                  </Card>  
                </div>        
            </Modal.Body>
            <Modal.Footer>
              <ButtonWithLoading
                handleClick={assignToCustomer}
                buttonText="Transfer"
                tooltip="Transfer location to customer."
                isLoading={isPending}

              />
                <Button variant="secondary" onClick={() => setShowTransfer(false)}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>      
  )
}

export default TransferLocation