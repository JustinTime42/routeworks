import React, { useEffect, useState } from 'react';
import AsyncActionButton from '../../buttons/AsyncActionButton';
import { Link } from 'react-router-dom';
import { Button, Card, Form } from 'react-bootstrap';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../firebase';

const initialUserDetails = {
  email: "",
  displayName: "",
  customClaims: {
    role: "",
    organization: ""
  },
  disabled: false
}

const UserEditor = () => {
  const [userFormVisible, setUserFormVisible] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedUser, setUpdatedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(initialUserDetails);

  const handleSearchUser = () => {
    // Send searchEmail to getUserByEmail Firebase function
    // Implement your logic here
    console.log(searchEmail)
    const fetchUser = httpsCallable(functions, 'rootFetchUser');
    fetchUser({ email: searchEmail }).then((result) => {
      setUserFormVisible(true)
      setUserDetails(result.data);
      console.log(result.data)
    });
  };

  const handleCreateUser = () => {
    setUserFormVisible(true);    
    setUserDetails(initialUserDetails);
  }

  const handleSaveUser = () => {
    // Send updatedUser to rootUpdateUser Firebase function
    // Implement your logic here
    const updateUser = httpsCallable(functions, 'rootUpdateUser');
    const createUser = httpsCallable(functions, 'rootCreateUser');
    if (userDetails.uid) {
      updateUser(userDetails).then((result) => {
        setUserFormVisible(false)
        setUserDetails(result.data);
        return result.data
      })
      .catch((error) => {
        throw new Error(error);
      })
    }
    else {
      createUser(userDetails).then((result) => {        
        setUserDetails(result.data);
      })
      .catch((error) => {
        throw new Error(error);
      });
    }
  };

  return (
    <div>
      <Link to="/">Go to Home</Link>
      <h1>User Editor</h1>      
      <div className="d-flex flex-row justify-content-center">        
        <Form.Control
          className="m-1 flex-2 w-50"
          type="email"  
          placeholder="Email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
        <Button className="m-1 flex-2" onClick={handleSearchUser}>Search Users</Button>
        <Button className="m-1" onClick={handleCreateUser}>Create New User</Button>
      </div>
      {userFormVisible && (
        <Card style={{maxWidth: 500, margin: '0 auto'}}>
        <Form className="p-2">
          <Form.Group>
            <Form.Control
              className="m-1"
              type="text"
              placeholder="Email"
              name="email"
              value={userDetails.email || ""}
              onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
            />
            <Form.Control
              className="m-1"
              type="text"
              placeholder="Display Name"
              name="displayName"
              value={userDetails.displayName || ""}
              onChange={(e) => setUserDetails({ ...userDetails, displayName: e.target.value })}
            />
            <Form.Control
              className="m-1"
              type="text"
              placeholder="Role"
              name="role"
              value={userDetails.customClaims.role || ""}
              onChange={(e) => setUserDetails({ ...userDetails, customClaims: {...userDetails.customClaims, role: e.target.value }})}
            />
            <Form.Control
              className="m-1"
              type="text"
              placeholder="Organization"
              name="organization"
              value={userDetails.customClaims.organization || ""}
              onChange={(e) => setUserDetails({ ...userDetails, customClaims: {...userDetails.customClaims, organization: e.target.value }})}
            />
            <Form.Check
              className="m-1"
              type="checkbox"
              label="Active"
              name="active"
              checked={!userDetails.disabled || false}
              onChange={(e) => setUserDetails({ ...userDetails, disabled: !userDetails.disabled })}
            />
          </Form.Group>
          {/* Form inputs for creating a new user */}
          {/* Implement your form inputs here */}
          <AsyncActionButton
            className="m-1"
            variant="primary"
            label="Save"
            asyncAction={async() => handleSaveUser()}
          />
          <Button className="m-1" onClick={() => setUserFormVisible(false)}>Cancel</Button>
        </Form>
        </Card>
      )}
    </div>
  );
};

export default UserEditor;
