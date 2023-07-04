import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { onSnapshot, doc } from "firebase/firestore"
import { db } from "../firebase"
import { appReducer } from ".."
import {loadStripe} from '@stripe/stripe-js/pure';

type IRootState = ReturnType<typeof appReducer>;

const Billing = () => {
  //const [stripeID, setStripeID] = useState("")
  const [chargesEnabled, setChargesEnabled] = useState(false)
  const [stripeObject, setStripeObject] = useState({})
  const [loading, setLoading] = useState(true)

  const organization = useSelector((state: IRootState) => state.setCurrentUser.currentUser.organization)


  // We're gonna have to move a lot of this connected account stuff to the backend Create endpoints to fetch the customer by id and return the customer object or whatever
  useEffect(() => {
    const unsub = onSnapshot(doc(db, `organizations`,  organization), (doc) => {
      const firebaseStripeAccount = doc.data()
      if (!firebaseStripeAccount?.stripe_account_id) {
        //redirect to onboarding workflow
      } else {
        // check if stripe account h
        
        setStripeObject(fetchStripe(firebaseStripeAccount.stripe_account_id)) 
      }           
    })
    return () => {
      unsub()
    }
  }, [organization])

  const fetchStripe = async (stripeID: string) => {
    const stripe = await loadStripe(process.env.STRIPE_PLATFORM_PUBLISHABLE_KEY || "", {
      stripeAccount: stripeID,
    });
    setLoading(false);
    return stripe
  }
}

export default Billing
