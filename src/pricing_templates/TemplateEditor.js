import React, { useEffect, useState } from 'react'
import SimpleSelector from "./SimpleSelector"
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'
import { useSelector, useDispatch } from "react-redux"
import { Col, Dropdown, Form, Row, Container, Button, Alert } from 'react-bootstrap';
import { GET_WORK_TYPES_SUCCESS, SET_WORK_TYPE, SET_ACTIVE_PRICING_TEMPLATE, GET_PRICING_TEMPLATES_SUCCESS } from '../constants';
import { showModal, setTempItem, setActiveItem, editItem, createItem, deleteItem } from '../actions';
import ButtonWithLoading from '../components/buttons/ButtonWithLoading';
import PriceModifierEditor from '../components/editor_panels/PriceModifierEditor';

const staticPricingMultiples = [{id: 0, name: "Per Hour"}, {id: 1, name:"Per Visit"}, {id: 2, name: "Per Yard"}, {id: 3, name: "Free"}]

const TemplateEditor = ({activeTemplate}) => {
  const [template, setTemplate] = useState(activeTemplate || {})
  // const [pricingMultiple, setPricingMultiple] = useState(activeTemplate?.work_type?.pricing_multiple)
  const [pricingMultiples, setPricingMultiples] = useState(staticPricingMultiples)
  const [priceModifiers, setPriceModifiers] = useState([])
  const [deleteAlert, setDeleteAlert] = useState(false)
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

  useEffect(() => {
    if (activeTemplate) {

    setTemplate(activeTemplate)
    console.log(activeTemplate)
    }
  },[activeTemplate])

  useEffect(() => {
    console.log(template)
  },[template])

  useEffect(() => {
    setTemplate(activeTemplate)
  },[activeTemplate])

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

  const priceModifiersQuery = () => {
    return onSnapshot(collection(db, `organizations/${organization}/price_modifiers`), (querySnapshot) => {
      // set results to pricingModifiers state variable
      setPriceModifiers(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})))      
    })
  }



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

  const onAddModifier = (event, workTypeName) => {
    console.log(event, workTypeName)
    const modifier = priceModifiers.find(item => item.name === event)
    console.log(modifier)
    setTemplate(template => ({
      ...template,
      workTypes: {
        ...template.workTypes, 
        [workTypeName]: {
          ...template.workTypes[workTypeName], 
          modifiers: [...template.workTypes?.[workTypeName]?.modifiers || [], {...modifier}]}
      }
    }))
    console.log(template)
  }

  const onRemoveModifier = (modifier, workTypeName) => {
    console.log(modifier, workTypeName)
    setTemplate(template => ({
      ...template,
      workTypes: {
        ...template.workTypes,
        [workTypeName]: {
          ...template.workTypes[workTypeName],
          modifiers: template.workTypes?.[workTypeName]?.modifiers.filter(item => item.name !== modifier.name)
        }
      }
    }))
    console.log(template)
  }

const onDeleteTemplate = () => {
  dispatch(deleteItem(template, pricingTemplates, `organizations/${organization}/pricing_templates`, SET_ACTIVE_PRICING_TEMPLATE, GET_PRICING_TEMPLATES_SUCCESS))
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
      <Container>
      <Form.Group as={Row}>
        <Form.Label >Template Name: </Form.Label>
        <Col >        
          <Form.Control 
            type="input" 
            placeholder="Enter Template Name" 
            value={template?.name} 
            onChange={(event) => setTemplate({...template, name: event.target.value})} 
          />
        </Col>
      <Col>
        <Button
          variant="primary"
          onClick={onSaveTemplate}
          size="sm"
        >Save Template</Button>                        
      </Col>
      <Col>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setDeleteAlert(true)}
        >Delete Template
        </Button>
        <Alert show={deleteAlert} variant="danger">
          <Alert.Heading>Confirm Delete Template?</Alert.Heading>
          This will not alter or remove existing price information on customers using this template
          <hr />
          <div className="d-flex justify-content-end">
          <Button onClick={onDeleteTemplate} variant="danger">
              Permanently Delete This Template              
          </Button>
          <Button style={{marginLeft:"1em"}} onClick={() => setDeleteAlert(false)} variant="success">
              Cancel
          </Button>
          </div>
        </Alert>
      </Col>
      </Form.Group>
      <Row style={{marginTop: "2em", textAlign:"center"}}>
        <Col xs={12} md={2}>Work Type</Col>
        <Col xs={12} md={2}>Pricing Basis</Col>
        <Col xs={12} md={2}>Pricing Multiple</Col>
        <Col xs={12} md={6}>Modifier</Col>
      </Row>
      {template && Object.keys(template?.workTypes).map((item, i) => (
        <Row style={{borderBottom: "1px solid rgb(200,200,200)", margin: "1em", padding: "1em", textAlign:"center"}}>
          <Col xs={12} md={2}>
            <Row>
            <Col>
              <Button
                size='sm'
                variant="danger"
                onClick={() => setTemplate(template => {
                  const newTemplate = {...template}
                  delete newTemplate.workTypes[item]
                  return newTemplate
                })}
              > Remove</Button></Col>
            <Form.Label as={Col}>{item}</Form.Label>  
            
            </Row>

                    
          </Col>
          {item && (
            <Col xs={12} md={2}>
              <Dropdown
                size="sm"
                onSelect={(event) => setTemplate(template => ({
                  ...template, 
                  workTypes: {...template.workTypes, [item]: {...template.workTypes[item], pricingBasis: event || {}}}
                  }))}>
                <Dropdown.Toggle size='sm'>
                  {template.workTypes[item].pricingBasis || `Select Pricing Basis`}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item eventKey="Work Type">Work Type</Dropdown.Item>
                  <Dropdown.Item eventKey="Vehicle Type">Vehicle Type</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>)}
            {item && (
            <Col xs={12} md={2}>
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
              permissions={[]}   
              dbQuery = {pricingMultiplesQuery}        
            />
            </Col>)}
            {item && (
            <Col xs={12} md={6}>
              <Row>
                <Col>
                  <SimpleSelector
                    title="Add Modifier"
                    selectedItem={null}
                    itemArray={priceModifiers}
                    whichModal="Pricing Modifiers"
                    onCreate={onCreate}
                    onEdit={onEdit}
                    onSelect={(event) => onAddModifier(event, item)} 
                    permissions={[]}   
                    dbQuery = {priceModifiersQuery}        
                  />
                </Col>
                <Col>
                {template.workTypes[item].modifiers?.map((modifier, i) => {
                    return (
                      <Row style={{marginTop: "1em"}} >
                        <Col><Form.Text>{modifier.name}: price  {modifier.operator} {modifier.value}</Form.Text></Col>
                        <Col><Button size='sm' onClick={() => onRemoveModifier(modifier, item)}>Remove</Button></Col>
                      </Row>
                    )                
                })
                }
                </Col>

              </Row>

            </Col>)}
        </Row>
      ))
      }
      <SimpleSelector
        title="Add Work Type"
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
      </Container>
      <PriceModifierEditor/>
      
      
    </div>

  )
}

export default TemplateEditor