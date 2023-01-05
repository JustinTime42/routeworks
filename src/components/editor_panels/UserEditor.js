import React, {  useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import {Button, Alert, Modal, Form, Row, Col, DropdownButton, Dropdown } from "react-bootstrap"
import { createItem, deleteItem, editItem, showModal, hideModal, setTempItem } from "../../actions"
import {GET_DRIVERS_SUCCESS, SET_ACTIVE_DRIVER, TEMP_ITEM} from '../../constants.js'
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "../../firebase";
import { sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";

const UserEditor = (props) => {
    const [deleteAlert, setDeleteAlert] = useState('')
    const modals = useSelector(state => state.whichModals.modals)
    const tempItem = useSelector(state => state.setTempItem.item)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const dispatch = useDispatch()
    const roles = ['Driver', 'Supervisor', 'Admin']

    useEffect(() => {
        if (!tempItem && modals.includes('User')) {
            dispatch(setTempItem({name: '', customClaims: {admin: false, supervisor: false, hourly: 0, percentage: 0}}))
        }
        console.log(tempItem)
    }, [tempItem])

    const onChange = (event) => {    
        let {target: {name, value} } = event
        if (name === "name") {
            dispatch(setTempItem({...tempItem, displayName: value}))
        } else {
            if (name === "percentage" || name === "hourly") {
                value = Number(value)
                if (isNaN(value)) {
                    return
                } else {
                    dispatch(setTempItem({...tempItem, customClaims: {...tempItem.customClaims, [name]: value}}))
                }
            } else if (value === 'on') {
                dispatch(setTempItem({...tempItem, disabled: !tempItem.disabled}))
            } else { dispatch(setTempItem({...tempItem, [name]:value}))}
        }
    }

    const onSelectRole = (role) => {
        dispatch(setTempItem({...tempItem, customClaims: {...tempItem.customClaims, role: role}}))
    }

    const onSave = () => {
        console.log(tempItem)
        if (tempItem.uid) { 
            console.log('updating user')
            const updateUser = httpsCallable(functions, 'updateUser')
            updateUser({...tempItem, customClaims: {...tempItem.customClaims, organization: organization}}).then(res => {                
                console.log(res)            
                let newUsers = [...props.users]
                newUsers[newUsers.findIndex(user => user.uid === res.data.uid)] = res.data
                props.setUsers(newUsers)
                alert(`${tempItem.displayName} updated.`)
            })
            .catch(err => console.log(err))
        }
        else {
            const createUser = httpsCallable(functions, 'createUser' )
            createUser(tempItem).then(i => {
                sendPasswordResetEmail(auth, i.data.email)
                props.setUsers([...props.users, i.data])
                alert(`${i.data.displayName} created.`)
            } ) 
        } 
        dispatch(hideModal('User'))
    }

    const onPasswordReset = () => {
        sendPasswordResetEmail(auth, tempItem.email)
        .then(alert(`Email has been sent to ${tempItem.email} with a link to reset your password`))
        .catch(err => alert(err))
    }

    const onDelete = (item) => {
        const user = item
        const deleteUser = httpsCallable(functions, 'deleteUser')
        deleteUser(user).then(() => {
            console.log(`${user.displayName} deleted`) 
            let newUsers = props.users.filter(i => i.uid !== user.uid)
            props.setUsers(newUsers)
            alert(`${user.displayName} deleted`)
        })
        .catch(err => {
            alert(err)
        })
        dispatch(hideModal('User'))                 
    }

    const onClose = () => {
        dispatch(setTempItem(null))
        dispatch(hideModal('User'))
        setDeleteAlert(false)
    }

    return (
        <Modal show={modals.includes('User')} onHide={onClose}>
            <Modal.Body style={{display: "flex", flexFlow: "column nowrap", justifyContent: "center", alignItems: "space-between"}}>
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>Name</Form.Label>
                    <Col sm={8}>
                        <Form.Control name="name" type="text" onChange={onChange} placeholder="Name" value={tempItem?.displayName || ''}/>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>Email</Form.Label>
                    <Col sm={8}>
                        <Form.Control name="email" type="text" onChange={onChange} placeholder="Email" value={tempItem?.email || ''}/>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>Percentage</Form.Label>
                    <Col sm={8}>
                        <Form.Control name="percentage" type="numeric" onChange={onChange} placeholder="Percentage" value={tempItem?.customClaims?.percentage || 0} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>Hourly</Form.Label>
                    <Col sm={8}>
                        <Form.Control name="hourly" type="numeric" onChange={onChange} placeholder="Hourly" value={tempItem?.customClaims?.hourly || 0} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} style={{margin:'1em'}}>
                    <Col>
                        <Form.Check
                            name="active"
                            type="checkbox"
                            label="Active?"
                            checked = {!tempItem?.disabled}
                            onChange={onChange}
                        /> 
                    </Col>
                    <Col>
                        <DropdownButton size="sm" title={tempItem?.customClaims?.role || "Role"} onSelect={onSelectRole}>
                            {
                                roles.map(role => {
                                    return (
                                        <Dropdown.Item key={role} eventKey={role}>{role}</Dropdown.Item>
                                    )
                                })
                            }
                        </DropdownButton>
                    </Col>
                    <Col>
                            <Button size="sm" onClick={onPasswordReset}>Reset Password</Button>
                    </Col>
                </Form.Group> 
                <div className="flex justify-content-around">
                    <Button variant="danger" style={{visibility: ((deleteAlert !== tempItem?.displayName) && tempItem) ? "initial" : "hidden"}} onClick={() => setDeleteAlert(tempItem)}>Delete</Button>
                    <Button disabled={!tempItem} style={{margin: "3px"}} onClick={onSave}>Save</Button>   
                    <Button style={{margin: "3px"}} variant="secondary" onClick={onClose}>Close</Button>
                </div>
                <Alert className="d-flex justify-content-around mb-3" show={deleteAlert === tempItem}>
                    <Button onClick={() => onDelete(tempItem)} variant="danger">
                        Delete {tempItem?.displayName}?
                    </Button>
                    <Button onClick={() => setDeleteAlert('')} variant="success">
                        Cancel
                    </Button>
                </Alert>      
            </Modal.Body> 
        </Modal>          
    )
}

export default UserEditor