import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export default function RedirectRoute({ children, condition, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        condition ? (
          <Redirect
            to={{
              pathname: "/dev/trade",
              state: { from: location }
            }}
          />
        ) : (
          <Redirect
            to={{
              pathname: "/dev/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}
