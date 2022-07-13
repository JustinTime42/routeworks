import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentUser } from '../actions'
import { Button, Form, Modal } from 'react-bootstrap'

import Parse from 'parse/dist/parse.min.js'

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
                <Form.Control name='username' type='text' value={username} onChange={(event) => setUsername(event.target.value)} />
                <Form.Label>Password</Form.Label>
                <Form.Control name='password' type='password' value={password} onChange={(event) => setPassword(event.target.value)} />

            </Form.Group>
            <Button onClick={() => doUserRegistration()} variant="primary">Submit</Button>
        </Form>
        /*
      <div>
        <div className="header">
          <img
            className="header_logo"
            alt="Back4App Logo"
            src={
              'https://blog.back4app.com/wp-content/uploads/2019/05/back4app-white-logo-500px.png'
            }
          />
          <p className="header_text_bold">{'React on Back4App'}</p>
          <p className="header_text">{'User Registration'}</p>
        </div>
        <div className="container">
          <h2 className="heading">{'User Registration'}</h2>
          <Divider />
          <div className="form_wrapper">
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              size="large"
              className="form_input"
            />
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              size="large"
              type="password"
              className="form_input"
            />
          </div>
          <div className="form_buttons">
            <Button
              onClick={() => doUserRegistration()}
              type="primary"
              className="form_button"
              color={'#208AEC'}
              size="large"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
      */
    );
  };