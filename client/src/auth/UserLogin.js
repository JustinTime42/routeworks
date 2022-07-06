import React, { useState } from 'react'
import { Button, Form, Card } from 'react-bootstrap'
import {logInWithEmailAndPassword} from '../firebase'

export const UserLogin = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')  

  return (
    <Card className="text-center" style={{ width: '18rem', marginTop: '2em', marginLeft: 'auto', marginRight: 'auto' }}>
      <Card.Header>Login</Card.Header>
      <Card.Body>
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
          onClick={() => logInWithEmailAndPassword(username, password)}
          variant="primary"
          size="large"
        >
          Log In
        </Button>
      </Card.Body>
    </Card>    
  )
}

