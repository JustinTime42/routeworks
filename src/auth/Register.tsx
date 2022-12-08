import {auth, httpsCallable, functions} from '../firebase'
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, ProgressBar } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { setCurrentUser } from '../actions'
import { useIdToken } from 'react-firebase-hooks/auth';
import RegisterUser from './RegisterUser.tsx'
import RegisterCompany from './RegisterCompany.tsx'

const Register = () => {     
    
    const [isLoading, setIsLoading] = useState(false)    
    const [loadingText, setLoadingText] = useState('')
    const [progress, setProgress] = useState(0)
    const [user, loading, error] = useIdToken(auth);
    const currentUser = useSelector(state => state.setCurrentUser.currentUser)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        if (error) {alert(error)}
        else if (user) {
            user.getIdTokenResult().then(result => {
                dispatch(setCurrentUser(result))
            })
        }
    }, [])
    
    const onSaveOrg = (orgName: string) => {
        setIsLoading(true)
        setLoadingText('Provisioning company database')
        setProgress(80)
        user?.getIdToken(true).then(i => {
            const createOrg = httpsCallable(functions, 'createOrg')
            setProgress(90)
            createOrg({orgName: orgName}).then(res => {
                user?.getIdToken(true).then(i => {
                    user.getIdTokenResult().then(user => {
                        setProgress(100)
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


    if (isLoading || loading) {
        console.log('is loading')
        return (
            <RegistrationMain>
                <DisplayProgress />
            </RegistrationMain>
        )
    } else if (!user) {
        return (
            <RegistrationMain>
                <RegisterUser setProgress={setProgress} setIsLoading={setIsLoading} setLoadingText={setLoadingText}/>
            </RegistrationMain>
        )
    } else if (!currentUser?.claims?.organization) {
        return (
            <RegistrationMain>
                <RegisterCompany onSaveOrg={onSaveOrg} />
            </RegistrationMain>
        )
    } else navigate('/')
}

export default Register