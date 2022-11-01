import { sendPasswordResetEmail } from 'firebase/auth'
import React, { useState } from 'react'
import { Button, Form, Card } from 'react-bootstrap'
import {auth, logInWithEmailAndPassword} from '../firebase'

export const UserLogin = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')  

  const onSubmit = (event) => {
    event.preventDefault()
    logInWithEmailAndPassword(username, password)
  }

  const onPasswordReset = () => {
    sendPasswordResetEmail(auth, username)
    .then(res => {
      alert(`Email has been sent to ${username} with a link to reset your password`)
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
            onClick={onSubmit}
            variant="primary"
            size="large"
            type="submit"
          >
            Log In
          </Button>
          <Button style={{marginLeft:'1em'}} onClick={onPasswordReset}>Forgot Password</Button>
        </Form>
        
      </Card.Body>
    </Card>    
  )
}