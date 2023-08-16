import {auth, httpsCallable, functions} from '../firebase'
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, ProgressBar } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { setCurrentUser } from '../actions'
import { useIdToken } from 'react-firebase-hooks/auth';
import RegisterUser from './RegisterUser.js'
import RegisterCompany from './RegisterCompany.js'
import { setIsLoading } from '../actions'

const Register = () => {  
    const [loadingText, setLoadingText] = useState('')
    const [progress, setProgress] = useState(0)
    const [user, loading, error] = useIdToken(auth);
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const isLoading = useSelector(state => state.setIsLoading.isLoading)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        if (error) {alert(error)}
        else if (user) {
            user.getIdTokenResult(true).then(result => {
                console.log(result.claims)
                dispatch(setCurrentUser(result))
            })
        }
    }, [user, loading, error])
    
    const onSaveOrg = (orgName) => {
        dispatch(setIsLoading(true))
        setLoadingText('Provisioning company database')
        setProgress(80)
        user?.getIdToken(true).then(i => {
            const createOrg = httpsCallable(functions, 'createOrg')
            setProgress(90)
            createOrg({orgName: orgName}).then(res => {
                user?.getIdToken(true).then(i => {
                    user.getIdTokenResult().then(user => {
                        setProgress(80)
                        dispatch(setCurrentUser(user))
                        navigate('/')
                    })  
                })
            })
            .catch(err => console.log(err))
        })
    }
    
    const RegistrationMain = (props) => (
        <Card className="text-center" style={{width: '18rem', marginTop: '2em', marginLeft: 'auto', marginRight: 'auto'}}>
            <Card.Header>
                Company Setup
            </Card.Header>
            <Card.Body>
                {props.children}
            </Card.Body>
        </Card>
    )   

    const DisplayProgress = () => ( 
        <>
            <p>{loadingText}</p>
            <ProgressBar now={progress} />
        </>
    )

    return (
        <RegistrationMain>
            <RegisterUser
                user={currentUser}
                setProgress={setProgress} 
                setLoadingText={setLoadingText}
            />
            {/* {(currentUser?.claims?.stripeRole === "Owner") && (
                <RegisterCompany user={currentUser} onSaveOrg={onSaveOrg} />
            )} */}
            {isLoading && <DisplayProgress />}                
        </RegistrationMain>
    )
}

export default Register