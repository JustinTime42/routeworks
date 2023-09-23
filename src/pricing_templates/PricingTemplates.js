import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import {Button, FormControl, Alert, Modal, Form, Row, Col } from "react-bootstrap"
import SimpleSelector from "./SimpleSelector";
import { setActiveItem, createItem, deleteItem, editItem, showModal, hideModal, setTempItem } from "../actions"
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'
import { GET_PRICING_TEMPLATES_SUCCESS, SET_ACTIVE_PRICING_TEMPLATE } from '../constants';
import TemplateEditor from './TemplateEditor';

const PricingTemplates = (props) => {
  const [deleteAlert, setDeleteAlert] = useState('')
  const [activeTemplate, setActiveTemplate] = useState(null)
  const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
  const pricingTemplates = useSelector(state => state.getPricingTemplates.pricingTemplates)
  const dispatch = useDispatch()

  // useEffect(() => {
  //   const unsub = onSnapshot(collection(db, `organizations/${organization}/pricing_templates`), (querySnapshot) => {
  //     if (querySnapshot.docs.length === 0) {
  //       return 
  //     }
  //     dispatch({type:GET_PRICING_TEMPLATES_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
  //   })
  //   return () => {
  //       unsub()
  //   }
  // },[])

  const templatesQuery = () => {
    return onSnapshot(collection(db, `organizations/${organization}/pricing_templates`), (querySnapshot) => {
      if (querySnapshot.docs.length === 0) {
        return 
      }
      dispatch({type:GET_PRICING_TEMPLATES_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
    })
  }

  useEffect(() => {
    setActiveTemplate(pricingTemplates.find(i => i.id === activeTemplate?.id))
  },[pricingTemplates])

  const onCreate = () => {
    // create a new pricing template in firestore
    setActiveTemplate({name: '', workTypes: {}})
    console.log("making new template")
    console.log(activeTemplate) 
  }

  const onEdit = () => {
  }

  const onSelect = (event) => {
    console.log(event)
    console.log(pricingTemplates)
    const template = pricingTemplates.find(i => i.name === event)
    setActiveTemplate(template)
    console.log(template)

  }

  return (
    <>
    <div style={{width:'80%', marginRight: 'auto', marginLeft: 'auto',}}>
      <h1>Pricing Templates</h1>
    </div>
    <div>
      <SimpleSelector
        title="Pricing Template"
        collection="pricing_templates"
        collectionPath={`organizations/${organization}/`}
        selectedItem = {activeTemplate}
        itemArray={pricingTemplates}
        setActiveAction={setActiveTemplate}
        onCreate={onCreate}
        onEdit={onEdit}
        onSelect={onSelect}
        permissions={['Admin']}
        dbQuery={templatesQuery}
        />
    </div>
    <hr/>
    {activeTemplate && (
      <TemplateEditor activeTemplate={activeTemplate}/>
    )}
    </>
  )
}

export default PricingTemplates