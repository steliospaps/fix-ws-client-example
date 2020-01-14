import React, { useState, useEffect } from 'react';

const AUTH_TYPE = {
  OAUTH: 'oauth',
  CREDENTIALS: 'login'
};

export default function Login(props) {
  const { service, authService, message, onLoginSuccessful, isLoginSuccessful, isConnected } = props;
  const [ sessionId, setSessionId ] = useState('ceecf2c9-afc5-41ad-aa91-989b9205e9c1');
  const [ identifier, setIdentifier ] = useState();
  const [ password, setPassword ] = useState();
  const [ authType, setAuthType ] = useState(AUTH_TYPE.OAUTH)

  useEffect(() => {
    const { MessageType } = message;
    if (service && MessageType) {
      switch(MessageType) {
        case "NegotiationResponse":
          service.sendEstablish(message.SessionId, +process.env.REACT_APP_CLIENT_HEARTBEAT);
          break;
        case "EstablishmentAck":
          service.startHeartbeat();
          onLoginSuccessful();
          break;
        default:
      }
    } else if(!isConnected) {
      if (authService) {
        authService.stopTokenRefresh();
      }
    }
  });

  function handleSessionId(event) {
    setSessionId(event.target.value);
  }

  function handleIdentifier(event) {
    setIdentifier(event.target.value);
  }

  function handlePassword(event) {
    setPassword(event.target.value);
  }

  function handleAuthType(event) {
    setAuthType(event.target.value);
  }

  async function handleNegotiate() {
    if (service) {
      let token = await authService.getOAuthToken(identifier, password);
      if (authType === AUTH_TYPE.CREDENTIALS) {
        token = `${identifier}:${password}`;
      }
      service.sendNegotiate(sessionId, authType, token);
    }
  }

  return (
    <div>
      {isLoginSuccessful ? 
          (<div>Login Successful!</div>) : (
            <div>
              <h3>Negotiate</h3>
              <div>Session ID</div>
              <input type="text" value={sessionId} onChange={handleSessionId} onInput={handleSessionId}/>
              <div>Credentials</div>
              <label>Username: </label><input type="text" value={identifier} onChange={handleIdentifier} onInput={handleIdentifier}/>
              <br />
              <label>Password: </label><input type="password" value={password} onChange={handlePassword} onInput={handlePassword}/>
              <br />
              <select onChange={handleAuthType}>
                <option value={AUTH_TYPE.OAUTH}>OAuth</option>
                <option value={AUTH_TYPE.CREDENTIALS}>Credentials</option>
              </select>
              <input type="button" value="Login" onClick={handleNegotiate} />
            </div>
          )}
      {!isConnected && <div>Connect to ws first</div>}
    </div>
  )
}
