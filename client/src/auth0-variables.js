export const AUTH_CONFIG = {
  domain: "justintime42.auth0.com",

  // roleUrl:  "https://snowline-route-manager.herokuapp.com/role", 
  // callbackUrl: "http://localhost:3000/callback",
  // clientId:"31gTnvhuk71pvHNuzTi4wDV33notQ39V",
  // clientId:"4a5CpQ0kBBRvRIExud9aiDsxJQNiWsOe",

  roleUrl: process.env.REACT_APP_ROLE_URL,
  callbackUrl: process.env.REACT_APP_CALLBACK_URL,
  clientId:process.env.REACT_APP_CLIENTID,
}