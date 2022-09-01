import React, { useEffect, useState } from "react"
import {Button, FormControl, Alert, Modal, Form, Container, Row, Col } from "react-bootstrap"
import { functions, httpsCallable, createUser, auth } from '../../firebase'


const UserEditor = (props) => {
    const [users, setUsers] = useState([])
    const [newUser, setNewUser] = useState({customClaims: {admin:false}})
    const [isEditing, setIsEditing] = useState(false)

    const onChange = (event) => {
        let { name, value, checked } = event.target 
        console.log(checked)
        if(event.target.getAttribute('uid')) {
            let tempUsers = [...users] 
            if (event.target.name === 'admin') {
                tempUsers[users.findIndex(user => user.uid === event.target.getAttribute('uid'))].customClaims[name] = checked            
            } else {
                tempUsers[users.findIndex(user => user.uid === event.target.getAttribute('uid'))][name] = value
            }      
            setUsers(tempUsers)
        } else {
            if(event.target.name === 'admin') {
                setNewUser({...newUser, customClaims: {admin: checked}})
            } else {
                setNewUser({...newUser, [name]:value})
            }            
            console.log(newUser)
        }
    }

    const onFetchUsers = () => {
        const getUsers = httpsCallable(functions, 'listUsers')
        getUsers()        
        .then(data => setUsers(data.data.users))
        .catch(err => console.log(err))
    }

    const onSaveUser = (user = null) => {
        if (user.uid) {
            const updateUser = httpsCallable(functions, 'updateUser')
            updateUser(user).then(i => {
                console.log(i)
                let newUsers = users
                newUsers[newUsers.findIndex(user => user.uid === i.data.uid)] = i.data
                setUsers(newUsers)
            })
        } else {
            const createUser = httpsCallable(functions, 'createUser' )
            createUser(newUser).then(i => {
                console.log(i)
                setUsers([...users, i.data])
            } ) 
        }
        setNewUser({displayName: '', email: '', password:'', customClaims: {admin:false}})    
    }

    return (
        <Container style={{width:'100vw', position:'fixed', marginTop:'400px'}}>
                <Button onClick={onFetchUsers}>Fetch Users</Button>
                <Button>Create New User</Button>
                <Button onClick={props.onClose}>Close</Button>
                <Form>
                    <Container>
                        <Row>
                            <Col sm={4}>Display Name</Col>
                            <Col sm={3}>Email</Col>
                            <Col sm={3}>Password</Col>
                            <Col sm={1}>Role</Col>
                        </Row>
                        <Row>
                            <Col sm={4}><Form.Control name="displayName" type="text" value={newUser.displayName} onChange={onChange} /></Col>
                            <Col sm={3}><Form.Control name="email" type="text" value={newUser.email} onChange={onChange} /></Col>
                            <Col sm={3}><Form.Control name="password" type="text" value={newUser.password} onChange={onChange} /></Col>
                            <Col sm={1}><Form.Check name="admin" type="checkbox" checked={newUser.customClaims?.admin} onChange={onChange} /></Col>
                            <Col sm={1}><Button onClick={onSaveUser}>Save</Button> </Col>                                                                        
                        </Row>
                        {
                            users.map(user => {
                                console.log(user)
                                return (
                                    <Row key={user.uid}>
                                        <Col sm={4}><Form.Control uid={user.uid} name="displayName" type="text" value={user.displayName} onChange={onChange} /></Col>
                                        <Col sm={3}><Form.Control uid={user.uid} name="email" type="text" value={user.email} onChange={onChange} /></Col>
                                        <Col sm={3}><Form.Control uid={user.uid} name="password" type="text" value={user.password} onChange={onChange} /></Col>
                                        <Col sm={1}><Form.Check  uid={user.uid} name="admin" type="checkbox" checked={user.customClaims?.admin} onChange={onChange} /></Col>
                                        <Col sm={1}><Button onClick={() => onSaveUser(user)}>Save</Button> </Col>                                                                        
                                    </Row>
                                )
                            })
                        }
                    </Container>
                </Form>
        </Container>
    )
}

export default UserEditor