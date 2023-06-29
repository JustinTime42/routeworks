import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { onSnapshot, doc } from "firebase/firestore"
import { db } from "../firebase"
import { appReducer } from ".."
import {loadStripe} from '@stripe/stripe-js';

type IRootState = ReturnType<typeof appReducer>;

const Billing = () => {
  const [stripeID, setStripeID] = useState("")
  const [chargesEnabled, setChargesEnabled] = useState(false)
  const [stripeObject, setStripeObject] = useState({})

  const organization = useSelector((state: IRootState) => state.setCurrentUser.currentUser.organization)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, `organizations`,  organization), (doc) => {
      if (!doc.data()?.stripe_account_id) {
        //redirect to onboarding workflow
      } else {
        setStripeID(doc.data()?.stripe_account_id) 
      }           
    })
    return () => {
      unsub()
    }
  }, [organization])

  useEffect(() => {
    //check if stripe account is fully set up

    if (stripeID) {
      setStripeObject(fetchStripe()) 
    }
  }, [stripeID])

  const fetchStripe = async () => {
    const stripe = await loadStripe(process.env.STRIPE_PLATFORM_PUBLISHABLE_KEY || "", {
      stripeAccount: stripeID,
    });
    return stripe
  }
}

export default Billing
