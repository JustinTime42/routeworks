const rules = {
    visitor: {
      static: ["home-page:visit"]
    },
    driver: {
      static: [
        "home-page:visit",
        "driver:visit"
      ],    
    },
    admin: {
      static: [
        "driver:visit",
        "admin:visit",
        "home-page:visit",
      ]
    }
  };
  
  export default rules;