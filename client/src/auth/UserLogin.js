import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import Parse from 'parse/dist/parse.min.js';
import { Button, Form, Card } from 'react-bootstrap'
import { setCurrentUser } from '../actions'
import { UserRegistration } from './UserRegistration';

export const UserLogin = () => {
  // State variables
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isNew, setIsNew] = useState(false)
  //const [currentUser, setCurrentUser] = useState(null);
  const dispatch = useDispatch()

  // Function that will return current user and also update current username
  const getCurrentUser = async function () {
    const currentUser = await Parse.User.current();
    // Update state variable holding current user
    //setCurrentUser(currentUser);
    console.log(currentUser)
    dispatch(setCurrentUser(currentUser))
    
    return currentUser;
  }

  const doUserLogIn = async function () {
    setIsNew(false)
    // Note that these values come from state variables that we've declared before
    const usernameValue = username;
    const passwordValue = password;
    try {
      const loggedInUser = await Parse.User.logIn(usernameValue, passwordValue);

      const currentUser = await Parse.User.current();
      console.log(loggedInUser === currentUser);
      // Clear input fields
      setUsername('');
      setPassword('');
      
      getCurrentUser();
      console.log('isnew', isNew)
      return true;
    } catch (error) {
      // Error can be caused by wrong parameters or lack of Internet connection
      alert(`Error! ${error.message}`);
      return false;
    }
    
  };

  return (
          isNew ? <UserRegistration setIsNew={setIsNew}/> : 
          <Card className="text-center" style={{ width: '18rem', marginTop: '2em', marginLeft: 'auto', marginRight: 'auto' }}>
            <Card.Header>Login</Card.Header>
            <Card.Body>
                <Card.Title>Special title treatment</Card.Title>
                <Card.Text>
                            <Form.Control
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    placeholder="Username"
                                    size="large"
                                    className="form_input"
                                    />
                                    <Form.Control
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Password"
                                    size="large"
                                    type="password"
                                    className="form_input"
                                />
                </Card.Text>
                <Button
                        onClick={() => doUserLogIn()}
                        variant="primary"
                        size="large"
                    >
                        Log In
                    </Button>
                    <p>Don't have an account? <Button variant='primary' onClick={() => setIsNew(true)}>Sign up</Button></p>
            </Card.Body>
            </Card>    
  )
};

