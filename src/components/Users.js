import React, { useEffect, useState } from "react"
import {useDispatch} from 'react-redux'
import {Button, FormControl, Alert, Modal, Form, Container, Row, Col } from "react-bootstrap"
import { setTempItem, showModal } from "../actions"
import { functions, httpsCallable, createUser, auth } from '../firebase'
import UserEditor from './editor_panels/UserEditor'


const Users = (props) => {
    const [users, setUsers] = useState([])
    const [newUser, setNewUser] = useState({customClaims: {Role:"Driver"}})
    const [isEditing, setIsEditing] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        onFetchUsers()
    },[])

    const onFetchUsers = () => {
        const getUsers = httpsCallable(functions, 'listUsers')
        getUsers()        
        .then(data => {
            console.log(data)
            setUsers(data.data)
        } )
        .catch(err => console.log(err))
    }

    const onEditUser = (user = {}) => {
        if (user) {
            dispatch(setTempItem(user))
        } else {
            dispatch(setTempItem({name: '', active: true, hourly: 0, percentage: 0, customClaims: {active: true, role: "Driver"}}))
        }
        dispatch(showModal('User'))
    }

    return (
        <>
        <Container>
            <Button onClick={onEditUser}>Create New User</Button>
            <Form>
                <Container>
                    <Row>
                        <Col sm={4}>Display Name</Col>
                    </Row>
                    {
                        users.map(user => {
                            return (
                                <Row key={user.uid} style={{ maxWidth: '60vw', margin: '1em', backgroundColor: 'rgba(211,211,211,0.02)'}}>
                                    <Col>{user.displayName}</Col>
                                    <Col><Button onClick={() => onEditUser(user)}>Edit</Button> </Col>                                                                        
                                </Row>
                            )
                        })
                    }
                </Container>
            </Form>
        </Container>
        <UserEditor users={users} setUsers={setUsers}/>
        </>

    )
}

export default Users