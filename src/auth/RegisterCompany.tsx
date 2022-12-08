import React, { useState, useEffect } from 'react'
import { Button, Form, Card, Modal, ProgressBar } from 'react-bootstrap'

export interface CompanyProps {
    onSaveOrg: (orgName: string) => void       
}

const RegisterCompany = ({onSaveOrg}: CompanyProps) => {
    const [orgName, setOrgName] = useState<string>('')

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
}

export default RegisterCompany