const {HttpsError} = require('firebase-functions/v2/https');

export const createStripeCustomer = async (customer, organization, db, stripe) => {
  const stripeCustomer = await stripe.customers.create(toStripeCustomerFields(customer));
  // query service log records whose cust_id matches customer.id
  // update to add the stripeID
  const logsRef = db.collection(`organizations/${organization}/service_logs`)
  const snapshot = await logsRef.where('cust_id', '==', customer.id).get()
  let promises = []
  snapshot.forEach(doc => {
    promises.push(db.doc(doc.ref.path).update({stripeID: stripeCustomer.id}))
  });
  return Promise.all(promises).then(async() => {
    const custRef = db.collection(`organizations/${organization}/customer`).doc(customer.id)
    await custRef.update({stripeID: stripeCustomer.id})
    return stripeCustomer
  }).catch(err => {return err})
}

export const createStripeAccountLink = (accountId, stripe) => {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: 'https://app.snowlinealaska.com/', // have front end retrigger link creation and direct to onboarding flow
    return_url: 'https://app.snowlinealaska.com/', // this is after successfully existing. check on front end for completed account
    type: 'account_onboarding',
  }).then((accountLink) => {
    return accountLink;
  }).catch((err) => {
    throw new HttpsError('unknown', 'Failed to generate account link');
  });
};

export const toStripeCustomerFields = (customer) => {
  return (
    {
      email: customer.cust_email || "",
      name: customer.cust_name || "",
      phone: customer.cust_phone || "",
      address: {
        line1: customer.bill_address || "",
        city: customer.bill_city || "",
        state: customer.bill_state || "",
        postal_code: customer.bill_zip || ""
      }
    }
  )
}