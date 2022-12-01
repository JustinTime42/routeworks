import {auth, db, logout, createUserWithEmailAndPassword, httpsCallable, functions} from '../firebase'
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Form, Card } from 'react-bootstrap'
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore'
import { updateProfile, sendEmailVerification } from 'firebase/auth'
import { setCurrentUser } from '../actions'
import { useAuthState } from 'react-firebase-hooks/auth'

const Register = () => {
    const [user] = useAuthState(auth);
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [orgName, setOrgName] = useState('')
    const [loading, setLoading] = useState(false)
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const dispatch = useDispatch()

    useEffect(() => {
        user?.getIdTokenResult().then(info => {
            console.log(info)
        })
        
    }, [user])
    const onSaveOrg = () => {
        const createOrg = httpsCallable(functions, 'createOrg')
        createOrg({orgName: orgName}).then(res => {
            console.log(res)
            user?.getIdTokenResult(true)
        })
        .catch(err => console.log(err))
        //This successfully adds organization document to db. didn't seem to update custom claims. 
        

    }
    // const getProducts = async() => {        
    //     setLoading(true)
    //     console.log('getting products')
    //     const q = query(collection(db, 'products'), where('active', '==', true))
    //     const querySnapshot = await getDocs(q)        
    //     querySnapshot.forEach(async(doc) => {
    //         const thisProd = {...doc.data()}
    //         console.log(doc.id, ' => ', doc.data());
    //         console.log(doc.ref)
    //         const priceSnap = await getDocs(collection(db,`${doc.ref.path}/prices`))
    //         await priceSnap.docs.forEach((doc) => {
    //             const thisPrice = {...doc.data(), price_id: doc.id}
    //             console.log({...thisProd, ...thisPrice})
    //             setProducts(products => [...products, {...thisProd, ...thisPrice}])
    //         })
    //     })  
    //     setLoading(false)     
    // }

    // const handleCheckout = async() => {
    //     setLoading(true)        
    //     const custRef = await doc(db, 'customers', currentUser.claims.user_id)
    //     console.log(custRef.path)
    //     // Create checkout session
    //     const checkoutRef = await addDoc(collection(db, `${custRef.path}/checkout_sessions`),{            
    //         price: selectedProduct,
    //         success_url: window.location.origin,
    //         cancel_url: window.location.origin,            
    //     })

    //     // Update display name
    //     updateProfile(auth.currentUser, {
    //         displayName: username,
    //     }).then(() => console.log('profile updated'))
    //     .catch(err => alert(err)) 
    //     onSnapshot(doc(db, `${custRef.path}/checkout_sessions`, checkoutRef.id), doc => {
    //         console.log(doc.data())
    //         if(doc.data().url) {
    //             window.location.assign(doc.data().url)
    //             setLoading(false)
    //         }
    //     })        
    // }

    
    const handleCheckout = async() => {
        if (password !== password2) {
            alert('passwords must match')
            return
        }
        setLoading(true) 
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
        console.log(userCredential)
        sendEmailVerification(auth.currentUser)
        .then(() => {
            updateProfile(auth.currentUser, {
            displayName: username,
            }).then(() => console.log('profile updated'))
            .catch(err => alert(err))
        })
        })
        .catch((error) => {
        alert(error.message)
        })           
        const custRef = await doc(db, 'customers', auth.currentUser.claims.user_id)
        console.log(custRef.path)
        // Create checkout session
        const checkoutRef = await addDoc(collection(db, `${custRef.path}/checkout_sessions`),{            
            price: 'price_1M70pcHadtZeRUpQbTjyNwqD',
            success_url: window.location.origin,
            cancel_url: window.location.origin,            
        })
        onSnapshot(doc(db, `${custRef.path}/checkout_sessions`, checkoutRef.id), doc => {
            console.log(doc.data())
            if(doc.data().url) {
                window.location.assign(doc.data().url)
                setLoading(false)
            }
        })        
    }

    return (
        <Card className="text-center" style={{ width: '18rem', marginTop: '2em', marginLeft: 'auto', marginRight: 'auto' }}>
        <Card.Header>Company Setup</Card.Header>

            <Card.Body>
            {
            currentUser ? 
            <Form>
                <Form.Control
                value={orgName}
                onChange={(event) => setOrgName(event.target.value)}
                placeholder="Organization Name"
                size="lg"
                className="form_input"
                /> 
            </Form> 
            :
            <Form>
            <Card.Text>
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
            </Card.Text>
            <Button
                onClick={handleCheckout}
                variant="primary"
                size="lg"
            >
                Proceed to Checkout
            </Button>
            </Form>  
                    } 
        <Button
            onClick={logout}
            variant="primary"
            size="lg"
            type="submit"
        >
            Log Out
        </Button> 
        <Button
            onClick={onSaveOrg}
            variant="primary"
            size="lg"
            type="submit"
        >
            Save
        </Button>         
        </Card.Body>        
        <p style={{visibility: loading ? 'visible' : 'hidden'}}>Loading...</p>
        {/* replace the above with a fancier modal */}
        </Card>    
    )
}

export default Register