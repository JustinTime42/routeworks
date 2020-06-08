export const AUTH_CONFIG = {
  domain: "justintime42.auth0.com",
  roleUrl: "https://snowline-route-manager.herokuapp.com/role",
  clientId: "4a5CpQ0kBBRvRIExud9aiDsxJQNiWsOe",
  // callbackUrl: process.env.REACT_APP_CALLBACK_URL,
  callbackUrl: "https://snowline-route-manager.herokuapp.com/callback",
  callbackUrl: "https://route-manager-app.herokuapp.com/callback",
    // callbackUrl: "http://localhost:3000/callback",
  //Now, I seem to need to set this env variable in heroku before git push heroku. 
  //then, it takes that configuration with it to productions... *sigh*

}