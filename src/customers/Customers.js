import React, { useState, useEffect } from 'react';
import { useHistory, Link, useNavigate } from 'react-router-dom';
import CustomerEditor from './CustomerEditor';
import { useSelector } from 'react-redux';
import SearchableInput from '../components/SearchableInput'
import { useParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { Timestamp, collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import LocationEditor from './LocationEditor';

const Customers = () => {
  const allCustomers = useSelector((state) => state.getAllCustomers.customers)
  const allServiceLocations = useSelector((state) => state.requestAllAddresses.addresses)
  const [searchTerm, setSearchTerm] = useState('');
  const [matchingCustomers, setMatchingCustomers] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [serviceLocations, setServiceLocations] = useState([]);
  const organization = useSelector((state) => state.setCurrentUser.currentUser.claims.organization);

  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchTerm(value);
  };

  useEffect(() => {
    if (searchTerm.length > 0) {
        const filteredCustomers = allCustomers.filter((i) => {
            if(i.cust_name?.toLowerCase().includes(searchTerm?.toLowerCase())) return true
            else if(i.cust_phone?.toLowerCase().includes(searchTerm?.toLowerCase())) return true
            else if(i.cust_email?.toLowerCase().includes(searchTerm?.toLowerCase())) return true
            else if(i.bill_address?.toLowerCase().includes(searchTerm?.toLowerCase())) return true
            else return false
        })
        setMatchingCustomers(filteredCustomers)
    } else {
        setMatchingCustomers([])
    }
  }, [searchTerm, allCustomers, setMatchingCustomers])

  useEffect(() => {
    console.log(customer)
    const q = query(
      collection(db, `organizations/${organization}/service_locations`),
      where("cust_id", "==", customer?.id || 'none')
    )
    const unsub = onSnapshot(q, (querySnapshot) => {
      const serviceLocations = [];
      querySnapshot.forEach((doc) => {
        serviceLocations.push({ ...doc.data(), id: doc.id })
      })
      setServiceLocations(serviceLocations)          
    })
    return () => {
      unsub()
  }
  }, [customer])

  useEffect(() => {
    console.log(serviceLocations)
  }, [serviceLocations])

  const handleCustomerClick = (custID) => {
    console.log(custID)
    setCustomer(allCustomers.find((customer) => customer.id === custID));
    // navigate(`./${custID}`);
  };

  const handleNewLocation = () => {
    let dateCreated = Timestamp.fromDate(new Date(Date.now()))
    setServiceLocations(locations => [...locations, 
      {cust_name: customer.cust_name, routesAssigned: {}, contract_type: "Per Occurrence", sand_contract: "Per Visit", date_created: dateCreated, cust_id: customer.id}])
  }



  return (
    <div className='d-flex flex-wrap justify-content-center'>
      <div className='col-xs-12 col-md-3 col-lg-2 col-xl-1'>
      <Button variant="primary" size="sm" className="ml-2 mb-1" onClick={() => setCustomer({})}>Create Customer</Button>
      <SearchableInput
        className="mr-2"
        name="searchTerm"
        searchValue={searchTerm}
        changeSearchValue={handleSearch}
        matches={matchingCustomers}
        selectItem={handleCustomerClick}
        handleBlur={() => setSearchTerm("")}
      />
      </div>
      {/* Render CustomerEditor component when cust_id param is present */}
      <div className='col-xs-12 col-sm-10 col-md-8 col-lg-4 col-xl-4'>      
      <CustomerEditor cust={customer} />
      </div>
      <div className='col-xs-12 col-sm-10 col-md-8 col-lg-6 col-xl-6'>
      {serviceLocations.length > 0 && <h4>Service Locations</h4>}
      {serviceLocations.map((location, i) => (
        <LocationEditor key={i} loc={location} />
      ))}
      <Button variant="primary" className="m-1" onClick={handleNewLocation}>Add Location</Button>
      </div>

    </div>
  );
};

export default Customers;
