import { sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth'
import { auth, logInWithEmailAndPassword, createUserWithEmailAndPassword } from '../firebase'
import React, { useState } from 'react'
import { Button, Form, Card } from 'react-bootstrap'

export const UserLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('') 
  const [password2, setPassword2] = useState('')
  const [isRegistering, setIsRegistering] = useState(false) 

  const onSubmit = (event) => {  
    event.preventDefault()  
    if (isRegistering) {
      if(password !== password2) alert('Passwords must match!')
      else if (!email || !password) alert('Please enter email and password.')
      else onCreateUser()   
    } else {      
      logInWithEmailAndPassword(email, password)
    }    
  }

  const onCreateUser = () => {
      createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential)
        sendEmailVerification(auth.currentUser)
        .then(() => {
          let checkoutPage = 'https://billing.stripe.com/p/login/test_8wM02m05CeBZ5iM8ww'
          alert('Please check your email for a verification link')
          window.open(checkoutPage, '_blank')
        })        
      })
      .catch((error) => {
        alert(error.message)
      })
  }

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
            {
              isRegistering ? 
              <Form.Control
              value={password2}
              onChange={(event) => setPassword2(event.target.value)}
              placeholder="Retype Password"
              size="large"
              type="password"
              className="form_input"
            /> : null
            }
          </Card.Text>
          <Button
            onClick={onSubmit}
            variant="primary"
            size="large"
            type="submit"
          >
            {isRegistering ? 'Submit' : 'Log In'}
          </Button>
          <Button 
            style={{margin:'1em', visibility: isRegistering ? 'hidden' : 'visible'}} 
            onClick={() => setIsRegistering(true)}>
              Register
            </Button>
          <Button onClick={onPasswordReset}>Forgot Password</Button>
        </Form>
        
      </Card.Body>
    </Card>    
  )
 
}