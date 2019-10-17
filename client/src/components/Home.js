import React from "react";

import { AuthConsumer } from "../authContext";
import Login from "../components/Login";
import Driver from "../containers/Driver"

const HomePage = () => (
  <AuthConsumer>
    {({ authenticated }) =>
      authenticated ? (                    
                  <Driver />              
      ) : (
        <div>
          <h2>Snowline Alaska.</h2>
          <Login />
        </div>
      )
    }
  </AuthConsumer>
);

export default HomePage;