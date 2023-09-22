import React, { useEffect, useState } from 'react'
import SimpleSelector from "./SimpleSelector"
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'
import { useSelector, useDispatch } from "react-redux"
import { Col, Dropdown, Form } from 'react-bootstrap';
import { GET_WORK_TYPES_SUCCESS, SET_WORK_TYPE } from '../constants';
import { showModal, setTempItem, setActiveItem } from '../actions';

const staticPricingMultiples = [{id: 0, name: "Per Hour"}, {id: 1, name:"Per Visit"}]
const TemplateEditor = ({activeTemplate}) => {
  const [template, setTemplate] = useState(activeTemplate)
  const [pricingMultiple, setPricingMultiple] = useState(null)
  const [pricingMultiples, setPricingMultiples] = useState(staticPricingMultiples)
  // const [activeWorkType, setActiveWorkType] = useState(null)
  const activeWorkType = useSelector(state => state.setActiveWorkType.workType)
  const [pricingSource, setPricingSource] = useState(null)
  const workTypes = useSelector(state => state.getWorkTypes.allWorkTypes)
  const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
  const dispatch = useDispatch()

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
    console.log(pricingMultiple)

  },[pricingMultiple])
  const onCreate = (whichModal) => {
    dispatch(setTempItem({name: ''}))
    dispatch(showModal(whichModal))
  }

  const onCreatePricingMultiple = () => {
    setPricingMultiple({name: ''})
    dispatch(showModal("PricingMultiple"))
  }

  const onEdit = (item, whichModal) => {
    dispatch(setTempItem(item))
    dispatch(showModal(whichModal))
  }

  const onEditPricingMultiple = (item) => {
    setPricingMultiple(item)
    dispatch(showModal("PricingMultiple"))
  }

  const onSelectWorkType = (event) => {
    dispatch(setActiveItem(event, workTypes, SET_WORK_TYPE))
  }

  const onSelectPricingMultiple = (event) => {
    setPricingMultiple(pricingMultiples.find(item => item.name === event))
  }

  return (
    <div>
      <Col xs={12} md={3}>
      <Form.Control type="input" placeholder="Enter Template Name" value={template?.name} onChange={(event) => setTemplate({...template, name: event.target.value})} />
      <SimpleSelector  
        title="Work Type"
        collection='work_type'
        collectionPath={`organizations/${organization}/`}
        selectedItem={activeWorkType}
        itemArray={workTypes}              
        whichModal="WorkType"
        setActiveAction={SET_WORK_TYPE} 
        reduxListAction= {GET_WORK_TYPES_SUCCESS}
        onCreate={onCreate}
        onEdit={onEdit}
        onSelect={onSelectWorkType}
        permissions={['Admin']}
        dbQuery = {workTypesQuery}
      />
      </Col>
      {activeWorkType && (
        <>
        <Dropdown
          size="sm"
          onSelect={(event) => setPricingSource(event)}>
          <Dropdown.Toggle size='sm'>
            {pricingSource || `Select Pricing Source`}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item eventKey="Work Type">Work Type</Dropdown.Item>
            <Dropdown.Item eventKey="Vehicle Type">Vehicle Type</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <SimpleSelector
          title="Pricing Multiple"
          selectedItem={pricingMultiple}
          itemArray={pricingMultiples}
          whichModal="PricingMultiple"
          onCreate={onCreatePricingMultiple}
          onEdit={onEditPricingMultiple}
          onSelect={onSelectPricingMultiple}  
          permissions={['Admin']}  
          dbQuery = {pricingMultiplesQuery}        
        />
        </>
          

      )
      }

    </div>

  )
}

export default TemplateEditor