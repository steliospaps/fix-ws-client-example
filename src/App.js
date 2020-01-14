import React, { useState } from 'react';
import { BrowserRouter as Router, Link, Switch, Route } from 'react-router-dom';
import IGWebsocketService from './services/ig-websocket-service';
import OAuthService from './services/auth-service';

import Charts from './charts';
import Login from './login';
import PreTrade from './pre-trade';

import './App.css';

export default function App() {
  const [ isConnected, setIsConnected ] = useState(false);
  const [ isEstablish, setIsEstablish ] = useState(false);
  const [ isLoginSuccessful, setIsLoginSuccessful ] = useState(false);
  const [ heartbeatEnabled, setHeartbeatEnabled ] = useState(false);
  const [ authService, setAuthService ] = useState(null);
  const [ service, setService ] = useState(null);
  const [ historicCandleData, setHistoricCandleData ] = useState([]);
  const [ loginMessage, setLoginMessage ] = useState({});
  const [ quoteMessage, setQuoteMessage ] = useState({});

  function resetState() {
    if (service) {
      service.stopHeartbeat();
    }
    setService(null);
    setIsConnected(false);
    setIsEstablish(false);
    setIsLoginSuccessful(false);
    setHeartbeatEnabled(false);
  }

  function handleLoginSuccessful() {
    setIsEstablish(true);
    setHeartbeatEnabled(true);
    setIsLoginSuccessful(true);
    setLoginMessage({});
  }

  function handleConnection() {
    if (isConnected) {
      service.stopHeartbeat();
      service.close();
    } else {
      const service = new IGWebsocketService(process.env.REACT_APP_WEBSOCKET_URL);
      setAuthService(new OAuthService())
      setService(service);
      setIsConnected(true);

      if (service) {
        service.fixpWebsocket.onopen = () => {
          setIsConnected(true);
        }

        service.fixpWebsocket.onerror = () => {
          resetState();
        }

        service.fixpWebsocket.onclose = () => {
          resetState();
        }

        service.fixpWebsocket.onmessage = (wsMessage) => {
          const { data } = wsMessage;
          const parseMessage = JSON.parse(data);
          if (parseMessage) {
            const { MessageType, MsgType } = parseMessage;
            if (MessageType) {
              if (MessageType === "NegotiationResponse" || MessageType === "EstablishmentAck") {
                setLoginMessage(parseMessage);
              }
            } else if (MsgType) {
              switch(MsgType) {
                case "Quote":
                  setQuoteMessage(parseMessage);
                  break;
                case "HistoricCandleResponse":
                  setHistoricCandleData(parseMessage.CandleData);
                  break;
                default:
                  console.log(parseMessage)
              }
            }
          }
        }
      }

    }
  }

  return (
    <div>
      <Router>
        <div className="App">
          <div>
            <ul>
              <li><Link to="/login">Login</Link> </li>
              <li><Link to="/pre-trade">Pre-Trade</Link> </li>
              <li><Link to="/charts">Charts</Link> </li>
            </ul>
          </div>
          <strong>Websocket status: {isConnected ?  'Connected': 'Closed'}</strong>
          <input type="button" value={isConnected ? 'Disconnect' : 'Connect' } onClick={handleConnection} />
        </div>
        <div className="router-view">
          <Switch>
            <Route path="/" exact></Route>
            <Route path="/login">
              <Login 
                service={service}
                authService={authService}
                message={loginMessage}
                heartbeatEnabled={heartbeatEnabled}
                isConnected={isConnected}
                isLoginSuccessful={isLoginSuccessful}
                onLoginSuccessful={handleLoginSuccessful}
              />
            </Route>
            <Route path="/pre-trade">
              <PreTrade
                isEstablish={isEstablish}
                quoteMessage={quoteMessage}
                service={service}
              />
            </Route>
            <Route path="/charts">
              <Charts
                isLoginSuccessful={isLoginSuccessful}
                candleData={historicCandleData}
                service={service}
              />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}

