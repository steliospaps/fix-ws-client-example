import React, { useState, useEffect } from 'react';
import uuidv1 from 'uuid/v1';
import {Row, Col, FormGroup, Form, FormSelect, Button} from 'shards-react';
import '../styles/login.css';
import InputField from './ui/input-field';

const AUTH_TYPE = {
  OAUTH: 'oauth',
  CREDENTIALS: 'login'
};

const AUTH_ERRORS = {
  "error.security.invalid-details": "Username or password is incorrect"
}

export default function Login(props) {
  const { service, authService, message, onLoginSuccessful, isLoginSuccessful, isConnected } = props;
  const [ identifier, setIdentifier ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ authType, setAuthType ] = useState(AUTH_TYPE.OAUTH)
  const [ error, setError ] = useState('');

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
      try {
        setError('');
        let token = null;
        if (authType === AUTH_TYPE.CREDENTIALS) {
          token = `${identifier}:${password}`;
        } else {
          token = await authService.getOAuthToken(identifier, password);
        }
        service.sendNegotiate(uuidv1(), authType, token);
      } catch({ response: { data: { errorCode } } }) {
        AUTH_ERRORS[errorCode] ? setError(AUTH_ERRORS[errorCode]) : setError(errorCode);
      }
    }
  }

  return (
    <div className="login-container">
      <Row>
        <Col></Col>
        <Col>
          {isLoginSuccessful ?
              (<div>Hi {identifier}, you can now start trading!</div>) 
              :
              (<div>
                  <h3>Login</h3>
                  <Form>
                    <FormGroup>
                      <InputField value={identifier} labelName={"Username"} id="username" type="text" onChange={handleIdentifier} onInput={handleIdentifier}/>
                      <InputField value={password} labelName={"Password"} id="password" type="password" onChange={handlePassword} onInput={handlePassword}/>

                      <label htmlFor="auth-type">Auth Type: </label>
                      <FormSelect id="auth-type" onChange={handleAuthType}>
                        <option value={AUTH_TYPE.OAUTH}>OAuth</option>
                        <option value={AUTH_TYPE.CREDENTIALS}>Credentials</option>
                      </FormSelect>
                      <Button className="login-button" theme="secondary" onClick={handleNegotiate}>Login</Button>
                    </FormGroup>
                  </Form>
                </div>
              )}
          {error && <div>{error}</div>}
        </Col>
        <Col></Col>
      </Row>
    </div>
  )
}
