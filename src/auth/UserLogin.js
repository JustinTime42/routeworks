import { sendPasswordResetEmail, sendEmailVerification, updateProfile } from 'firebase/auth'
import { auth, db, logInWithEmailAndPassword, createUserWithEmailAndPassword, logout } from '../firebase'
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore'
import React, { useState } from 'react'
import { Button, Form, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export const UserLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('') 
  
  const onSubmit = (event) => {  
    event.preventDefault()       
    logInWithEmailAndPassword(email, password)
  }

  const onPasswordReset = () => {
    sendPasswordResetEmail(auth, email)
    .then(res => {
      alert(`Email has been sent to ${email} with a link to reset your password`)
    })
    .catch(err => alert(err))
  }

  const handleRegister = () => {
    window.location.assign()
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
            onClick={handleRegister}
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