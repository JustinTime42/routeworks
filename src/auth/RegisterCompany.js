import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'

const RegisterCompany = ({user, onSaveOrg}) => {
    const [orgName, setOrgName] = useState('')

    if (user?.claims?.stripeRole === "Owner") {
        return (
            <Form>
                <Form.Control
                value={orgName}
                onChange={(event) => setOrgName(event.target.value)}
                placeholder="Organization Name"
                size="lg"
                className="form_input"
                /> 
                <Button onClick={() => onSaveOrg(orgName)} variant='primary' size='lg'>
                    Save
                </Button>
            </Form>
        )
    } else return null

}

export default RegisterCompany