import React, { useState } from 'react'
import { auth, createUserWithEmailAndPassword } from '../firebase'
import { Button, Form } from 'react-bootstrap'

export const UserRegistration = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const createUser = () => {
    if(email && password) {
      createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential)
        alert('Please check your email for a verification link')
      })
      .catch((error) => {
        alert(error.message)
      })
    } else {
      alert('Please enter email and password.')
    }
  }

  return (
    <Form>
        <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control name='email' type='email' value={email} onChange={(event) => setEmail(event.target.value)} />
            <Form.Label>Password</Form.Label>
            <Form.Control name='password' type='password' value={password} onChange={(event) => setPassword(event.target.value)} />
        </Form.Group>
        <Button onClick={createUser} variant="primary">Submit</Button>
    </Form>  
  )
}