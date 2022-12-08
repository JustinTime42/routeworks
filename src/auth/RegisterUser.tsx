import {auth, db, createUserWithEmailAndPassword} from '../firebase'
import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { updateProfile, sendEmailVerification } from 'firebase/auth'
import { addDoc, collection, doc, onSnapshot } from 'firebase/firestore'

export interface UserProps {
    setProgress: React.Dispatch<React.SetStateAction<number>> 
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
    setLoadingText: React.Dispatch<React.SetStateAction<string>>       
}

const RegisterUser = ({ setProgress, setIsLoading, setLoadingText }: UserProps) => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')

    const handleCheckout = () => {
        if (password !== password2) {
            alert('passwords must match')
            return
        }
        setIsLoading(true)         
        setProgress(10)        
        setLoadingText('Setting up user profile.')
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            setLoadingText('sending verification email')
            setProgress(30)
            sendEmailVerification(auth.currentUser)
            .then(() => {
                updateProfile(auth.currentUser, {
                displayName: username,
                }).then(async() => {
                    setProgress(40)
                    setLoadingText('Redirecting to checkout page.')
                    const custRef = await doc(db, 'customers', auth.currentUser.uid)
                    // Create checkout session
                    const checkoutRef = await addDoc(collection(db, `${custRef.path}/checkout_sessions`),{            
                        price: 'price_1M70pcHadtZeRUpQbTjyNwqD',
                        success_url: `${window.location.origin}/register`,
                        cancel_url: window.location.origin,            
                    })
                    onSnapshot(doc(db, `${custRef.path}/checkout_sessions`, checkoutRef.id), doc => {
                        if(doc.data().url) {
                            window.location.assign(doc.data().url)
                            setProgress(60)
                            setIsLoading(false)
                        }
                    })      
                })
                .catch(err => alert(err))
            })
        })
        .catch((error) => {
            alert(error.message)
        })         
    }

    return (
        <Form>
            <Form.Control
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="User Name"
                size="lg"
                className="form_input"
            />
            <Form.Control
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                size="lg"
                className="form_input"
            />
            <Form.Control
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                size="lg"
                type="password"
                className="form_input"
            />
            <Form.Control
                value={password2}
                onChange={(event) => setPassword2(event.target.value)}
                placeholder="Retype Password"
                size="lg"
                type="password"
                className="form_input"
            />
            <Button onClick={handleCheckout} variant='primary' size='lg'>
                Proceed to Checkout
            </Button>
        </Form>
    )        
}

export default RegisterUser