import {auth, db, createUserWithEmailAndPassword, functions, httpsCallable} from '../firebase'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Button, Form } from 'react-bootstrap'
import { updateProfile, sendEmailVerification } from 'firebase/auth'
import { addDoc, collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { setIsLoading } from '../actions'

const RegisterUser = ({ currentUser, setProgress, setLoadingText }) => {
    const [orgName, setOrgName] = useState('')
    const [username, setUsername] = useState(currentUser?.claims?.name)
    const [email, setEmail] = useState(currentUser?.claims?.email)
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const dispatch = useDispatch()

    //check if user already created
    const createUser = () => {
        if (password !== password2) {
            alert('passwords must match')
            return
        }
        dispatch(setIsLoading(true))        
        setProgress(10)        
        setLoadingText('Setting up user profile.')
        if (!currentUser) {
            createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                sendEmailVerification(userCredential.user)
                .then(() => {
                    updateProfile(userCredential.user, {
                    displayName: username,
                    })
                    .then(async() => {
                        handleCheckout(userCredential.user)                    
                    })
                    .catch(err => alert(err))
                })
            })          
        } else {
            handleCheckout()
        }
    }

    const handleCheckout = async (user) => {
        const custRef = doc(db, 'customers', user.uid)
        setProgress(40)
        setLoadingText('Redirecting to checkout page.')
        const createConnectedAccount = httpsCallable(functions, 'createStripeConnectedAccount')
        createConnectedAccount({email: email, orgName: orgName }).then(async(res) => {
            window.open(res.url, '_blank') 
            dispatch(setIsLoading(false))
            setProgress(100)
            setLoadingText('Account created!')
        })
        .catch(err => {
            alert(err)
            dispatch(setIsLoading(false))
        })
        // Create checkout session
        // change this to create charge on connected account
        // const checkoutRef = await addDoc(collection(db, `${custRef.path}/checkout_sessions`),{            
        //     price: process.env.REACT_APP_STRIPE_PRICE_ID,
        //     success_url: `${window.location.origin}`,
        //     cancel_url: window.location.origin,            
        // })
        // onSnapshot(doc(db, `${custRef.path}/checkout_sessions`, checkoutRef.id), doc => {
        //     if(doc.data()?.url) {
        //         window.location.assign(doc.data()?.url)
        //         setProgress(60)                            
        //     }
        // })     
    }

    return (
        <Form>
            <Form.Control
                value={orgName}
                onChange={(event) => setOrgName(event.target.value)}
                placeholder="Organization Name"
                size="lg"
                className="form_input"
            /> 
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
            <Button onClick={createUser} variant='primary' size='lg'>
                Proceed to Stripe Setup
            </Button>
        </Form>
    )        
}

export default RegisterUser