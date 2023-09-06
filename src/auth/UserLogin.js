import { sendPasswordResetEmail, getAuth, signInWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form, Card } from 'react-bootstrap'
import { Link, redirect, useNavigate } from 'react-router-dom'
import { setCurrentUser } from '../actions';

export const UserLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('') 
  const currentUser = useSelector(state => state.setCurrentUser.currentUser)
  const dispatch = useDispatch()
  const auth = getAuth()
  const navigate = useNavigate()
  
  const onSubmit = (event) => {      
    event.preventDefault()       
    signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      userCredential.user.getIdTokenResult().then(result => {
        dispatch(setCurrentUser(result))
        navigate('/displayRoute')
      })      
    })
    .catch(err => alert(err))
  }

  // useEffect(() => {
  //   console.log(currentUser)
  //   if (currentUser) {
  //     navigate('/displayRoute')
  //   }   
  // },[currentUser])

  const onPasswordReset = () => {
    sendPasswordResetEmail(auth, email)
    .then(res => {
      alert(`Email has been sent to ${email} with a link to reset your password`)
    })
    .catch(err => alert(err))
  }

  return (
    <Card className="text-center" style={{ width: '18rem', marginTop: '2em', marginLeft: 'auto', marginRight: 'auto' }}>
      <Card.Header>Login</Card.Header>
      <Card.Body>
        <Form>
          <Card.Text>
            <Form.Control
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
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
            onClick={onSubmit}
            variant="primary"
            size="large"
            type="submit"
            style={{margin:'1em'}}
          >
            Log In
          </Button>
          <Button
            variant="primary"
            size="large"
            type="submit"
            style={{margin:'1em'}}
            as = {Link}
            to ='/register'
          >
            Register
          </Button>
          <Button 
            style={{margin:'1em'}}
            onClick={onPasswordReset}>
            Forgot Password
          </Button>
        </Form>        
      </Card.Body>
    </Card>    
  ) 
}