export const AUTH_CONFIG = {
  domain: "justintime42.auth0.com",
  roleUrl: process.env.REACT_APP_ROLE_URL,
  clientId: process.env.REACT_APP_CLIENTID,
  // callbackUrl: process.env.REACT_APP_CALLBACK_URL,
  callbackUrl: process.env.REACT_APP_CALLBACK_URL, // "https://snowline-route-manager.herokuapp.com/callback",
  // callbackUrl: "https://route-manager-app.herokuapp.com/callback",
    // callbackUrl: "http://localhost:3000/callback",
  //Now, I seem to need to set this env variable in heroku before git push heroku. 
  //then, it takes that configuration with it to productions... *sigh*

}