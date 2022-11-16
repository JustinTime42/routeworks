import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentUser } from '../actions'
import { Button, Form, Modal } from 'react-bootstrap'

export const UserRegistration = (props) => {
    const [username, setUsername] = useState('')
    const [fullName, setfullName] = useState('')
    const [password, setPassword] = useState('')
    const dispatch = useDispatch()
    
    const doUserRegistration = async function () {
        // Note that these values come from state variables that we've declared before
        const fullNameValue = fullName
        const usernameValue = username
        const passwordValue = password

        const user = new Parse.User() // ParseUser.createUser(usernameValue, passwordValue)
        user.set('fullName', fullNameValue)
        user.set('username', usernameValue)
        user.set('password', passwordValue)
        
        try {
          // Since the signUp method returns a Promise, we need to call it using await
            let createdUser = await user.signUp();
          console.log("stuff", createdUser)
          props.setIsNew(false)
          dispatch(setCurrentUser(user))
          alert(
            `Success! User ${user.getUsername()} was successfully created!`
          );
          return true;
        } catch (error) {
            
          // signUp can fail if any parameter is blank or failed an uniqueness check on the server
          alert(`Error! ${error}`);
          return false;
        }
      };

    return (
        <Form>
            <Form.Group>
                <Form.Label>Full Name</Form.Label>
                <Form.Control name='fullName' type='text' value={fullName} onChange={(event) => setfullName(event.target.value)} />
                <Form.Label>Email</Form.Label>
                <Form.Control name='email' type='email' value={email} onChange={(event) => setUsername(event.target.value)} />
                <Form.Label>Password</Form.Label>
                <Form.Control name='password' type='password' value={password} onChange={(event) => setPassword(event.target.value)} />

            </Form.Group>
            <Button onClick={() => doUserRegistration()} variant="primary">Submit</Button>
        </Form>
    
    );
  };