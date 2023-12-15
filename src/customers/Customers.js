import React, { useState, useEffect } from 'react';
import { useHistory, Link, useNavigate } from 'react-router-dom';
import CustomerEditor from './CustomerEditor';
import { useSelector } from 'react-redux';
import SearchableInput from '../components/SearchableInput'
import { useParams } from 'react-router-dom';


const Customers = () => {
  const allCustomers = useSelector((state) => state.getAllCustomers.customers)
  const allServiceLocations = useSelector((state) => state.requestAllAddresses.addresses)
  const [searchTerm, setSearchTerm] = useState('');
  const [matchingCustomers, setMatchingCustomers] = useState([]);
  const [customer, setCustomer] = useState(null);

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

  const handleCustomerClick = (custID) => {
    console.log(custID)
    setCustomer(allCustomers.find((customer) => customer.id === custID));
    // navigate(`./${custID}`);
  };

  return (
    <div className='d-flex'>
      <SearchableInput
        name="searchTerm"
        searchValue={searchTerm}
        changeSearchValue={handleSearch}
        matches={matchingCustomers}
        selectItem={handleCustomerClick}
        handleBlur={() => setSearchTerm("")}
      />

      <Link to="/admin/customers/new">Create new customer</Link>

      {/* Render CustomerEditor component when cust_id param is present */}
      {<CustomerEditor cust={customer} />}
    </div>
  );
};

export default Customers;
