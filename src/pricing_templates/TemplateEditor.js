import React, { useEffect, useState } from 'react'
import SimpleSelector from "./SimpleSelector"
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'
import { useSelector, useDispatch } from "react-redux"
import { Col, Dropdown, Form, Row } from 'react-bootstrap';
import { GET_WORK_TYPES_SUCCESS, SET_WORK_TYPE, SET_ACTIVE_PRICING_TEMPLATE, GET_PRICING_TEMPLATES_SUCCESS } from '../constants';
import { showModal, setTempItem, setActiveItem, editItem, createItem } from '../actions';
import ButtonWithLoading from '../components/buttons/ButtonWithLoading';

const staticPricingMultiples = [{id: 0, name: "Per Hour"}, {id: 1, name:"Per Visit"}]

const TemplateEditor = ({activeTemplate}) => {
  const [template, setTemplate] = useState(activeTemplate || {})
  // const [pricingMultiple, setPricingMultiple] = useState(activeTemplate?.work_type?.pricing_multiple)
  const [pricingMultiples, setPricingMultiples] = useState(staticPricingMultiples)
  // const [activeWorkType, setActiveWorkType] = useState(null)
  // const activeWorkType = useSelector(state => state.setActiveWorkType.workType)
  // const [pricingSource, setPricingSource] = useState(activeTemplate?.work_type?.pricing_source)
  const [newWorkType, setNewWorkType] = useState(null)
  const workTypes = useSelector(state => state.getWorkTypes.allWorkTypes)
  const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
  const pricingTemplates = useSelector(state => state.getPricingTemplates.pricingTemplates)
  const dispatch = useDispatch()

 /*
 templateObject:
 {
  name: "Snow Service"
  id: "asdfaosdifj"
  workTypes: [
    {
      name: "Snow Plowing",
      pricing_multiple: "Per Hour",
      pricing_source: "Work Type"
    },
  ]

 */

  const workTypesQuery = () => {
    return onSnapshot(collection(db, `organizations/${organization}/work_type`), (querySnapshot) => {
      dispatch({type:GET_WORK_TYPES_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
    })
  }

  const pricingMultiplesQuery = () => {
    return onSnapshot(collection(db, `organizations/${organization}/pricing_muliples`), (querySnapshot) => {
      // add the results to staticPricingMultiples state variable
      console.log([...staticPricingMultiples, ...querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))])
      setPricingMultiples([...staticPricingMultiples, ...querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))])      
    })
  }

  useEffect(() => {
    setTemplate(activeTemplate)
  },[activeTemplate])

  // useEffect(() => {    
  //   if (activeWorkType.name) {
  //     setTemplate((template) => (
  //       {
  //         ...template, 
  //         workTypes: {
  //           ...template.workTypes, 
  //           [activeWorkType.name]: {
  //             name: activeWorkType?.name, 
  //             pricing_multiple: pricingMultiple?.name, 
  //             pricing_source: pricingSource}}
  //       }))
  //   }
  // },[activeWorkType, pricingMultiple, pricingSource])

  useEffect(() => {
    if (activeTemplate) {

    setTemplate(activeTemplate)
    console.log(activeTemplate)
    }
  },[activeTemplate])

  useEffect(() => {
    console.log(template)
  },[template])
  
  const onCreate = (whichModal) => {
    dispatch(setTempItem({name: ''}))
    dispatch(showModal(whichModal))
  }

  const onCreatePricingMultiple = () => {
    dispatch(showModal("PricingMultiple"))
  }

  const onEdit = (item, whichModal) => {
    dispatch(setTempItem(item))
    dispatch(showModal(whichModal))
  }

  const onEditPricingMultiple = (item) => {
    dispatch(showModal("PricingMultiple"))
  }

  const onSaveTemplate = () => {
    if (!template.name) {alert('please enter template name')}
    else {
      if (template.id) {    
        dispatch(editItem(template, pricingTemplates, `organizations/${organization}/pricing_templates`, SET_ACTIVE_PRICING_TEMPLATE, GET_PRICING_TEMPLATES_SUCCESS))
      }
      else {
        dispatch(createItem(template, pricingTemplates, `organizations/${organization}/pricing_templates`, SET_ACTIVE_PRICING_TEMPLATE, GET_PRICING_TEMPLATES_SUCCESS))
      }    
    }
    console.log(template)
  }

  return (
    <div>
      <Form.Group as={Row}>
        <Col>
          <Form.Control 
            type="input" 
            placeholder="Enter Template Name" 
            value={template?.name} 
            onChange={(event) => setTemplate({...template, name: event.target.value})} 
          />
        </Col>
      <Col>
        <ButtonWithLoading
          variant="primary"
          onClick={onSaveTemplate}
          isLoading={false}
          buttonText="Save Template"
          size="sm"
        />
      </Col>
      </Form.Group>
      <Row style={{marginTop: "2em", textAlign:"center"}}>
        <Col>Work Type</Col>
        <Col>Pricing Basis</Col>
        <Col>Pricing Multiple</Col>
      </Row>
      {template && Object.keys(template?.workTypes).map((item, i) => (
        <Row style={{borderBottom: "1px solid rgb(200,200,200)", margin: "1em", padding: "1em", textAlign:"center"}}>
          <Col xs={12} md={3}>
            <Form.Label>{item}</Form.Label>          
          </Col>
          {item && (
            <>
            <Col>
              <Dropdown
                size="sm"
                onSelect={(event) => setTemplate(template => ({
                  ...template, 
                  workTypes: {...template.workTypes, [item]: {...template.workTypes[item], pricingSource: event || {}}}
                  }))}>
                <Dropdown.Toggle size='sm'>
                  {template.workTypes[item].pricingSource || `Select Pricing Source`}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item eventKey="Work Type">Work Type</Dropdown.Item>
                  <Dropdown.Item eventKey="Vehicle Type">Vehicle Type</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col>
            <SimpleSelector
              title="Pricing Multiple"
              selectedItem={{name: template.workTypes[item].pricingMultiple}}
              itemArray={pricingMultiples}
              whichModal="PricingMultiple"
              onCreate={onCreatePricingMultiple}
              onEdit={onEditPricingMultiple}
              onSelect={(event) => setTemplate(template => ({
                ...template, 
                workTypes: {...template.workTypes, [item]: {...template.workTypes[item], pricingMultiple: event || {}}}
                }))}  
              permissions={['Admin']}   
              dbQuery = {pricingMultiplesQuery}        
            />
            </Col>
            </>
          )
          }
        </Row>
      ))
      }
      <SimpleSelector
        title="Work Type"
        collection='work_type'
        collectionPath={`organizations/${organization}/`}
        selectedItem={newWorkType}
// itemArray should be work types that aren't already in the template
        itemArray={workTypes.filter(item => !Object.keys(template?.workTypes).includes(item.name))} 
        whichModal="WorkType"
        setActiveAction={SET_WORK_TYPE} 
        reduxListAction= {GET_WORK_TYPES_SUCCESS}
        onCreate={onCreate}
        onEdit={onEdit}
        onSelect={(event) => setTemplate(template => ({
          ...template, 
          workTypes: {...template.workTypes, [event]: template.workTypes.event || {}} 
        }))}
        permissions={['Admin']}
        dbQuery = {workTypesQuery}
      />
      
      
    </div>

  )
}

export default TemplateEditor