import React, { useState } from 'react';
import { Nav, Navbar, NavbarBrand, NavItem, NavLink, Button, Container } from 'shards-react';
import { BrowserRouter as Router, Link, Switch, Route} from 'react-router-dom';
import IGWebsocketService from './services/ig-websocket-service';
import OAuthService from './services/auth-service';
import Login from './component/login';
import PreTrade from './component/pre-trade';
import PreTradeServiceComponent from './services/pre-trade-service';
import AuthenticatedRoute from './component/route/authenticated-route';
import RedirectRoute from './component/route/redirect-route';

import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "shards-ui/dist/css/shards.min.css"

export default function App() {
  const [ isConnected, setIsConnected ] = useState(false);
  const [ isEstablish, setIsEstablish ] = useState(false);
  const [ isLoginSuccessful, setIsLoginSuccessful ] = useState(false);
  const [ heartbeatEnabled, setHeartbeatEnabled ] = useState(false);
  const [ authService, setAuthService ] = useState(null);
  const [ service, setService ] = useState(null);
  const [ historicCandleData, setHistoricCandleData ] = useState([]);
  const [ chartSubscriptionData, setChartSubscriptionData ] = useState({});
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
    setIsLoginSuccessful(false);
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
      setAuthService(new OAuthService())
      setService(new IGWebsocketService(process.env.REACT_APP_WEBSOCKET_URL));
      setIsConnected(true);
    }
  }

  function handlePreTradeMessages(message) {
    const { MessageType, MsgType } = message;
    if (MessageType) {
      if (MessageType === "NegotiationResponse" || MessageType === "EstablishmentAck") {
        setLoginMessage(message);
      }
    } else if (MsgType) {
      switch(MsgType) {
        case "Quote":
          setQuoteMessage(message);
          break;
        case "HistoricCandleResponse":
          setHistoricCandleData(message.CandleData);
          break;
        case "ChartDataSubscriptionResponse":
          setChartSubscriptionData(message)
          break;
        default:
          console.log(message)
      }
    }
  }

  return (
    <div>
      <PreTradeServiceComponent
        onMessage={handlePreTradeMessages}
        onOpen={() => setIsConnected(true)}
        onError={() => resetState()}
        onClose={() => resetState()}
        service={service}
      />
      <Router>
        <div className="App">
          <Navbar type="dark" theme="danger" expand="md">
            <NavbarBrand href="#">Example Client</NavbarBrand>
            <Nav navbar>
              {!isLoginSuccessful ? (
              <NavItem>
                <Link className="nav-link active" to="/login">Login</Link>
              </NavItem>) : (
                <div style={{'display': 'inherit'}}>
                  <NavItem>
                    <Link className="nav-link active" to="/pre-trade">Trade</Link>
                  </NavItem>
                </div>
              )}
            </Nav>
            <Nav navbar className="ml-auto">
              <NavItem>
                <NavLink active>
                  Status: {isConnected ?  'Connected': 'Closed'}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink>
                  <Button className="button-navbar" theme="secondary" value={isConnected ? 'Disconnect' : 'Connect' } onClick={handleConnection}>
                    {isConnected ? 'Disconnect' : 'Connect' }
                  </Button>
                </NavLink>
              </NavItem>
            </Nav>
          </Navbar>
        </div>
        <Container>
          <div className="router-view">
            <Switch>
              <RedirectRoute condition={isEstablish} path="/" exact />
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
              <AuthenticatedRoute condition={isEstablish} path="/pre-trade">
                <PreTrade
                  isEstablish={isEstablish}
                  quoteMessage={quoteMessage}
                  service={service}
                  candleData={historicCandleData}
                  candleSubscriptionData={chartSubscriptionData}
                />
              </AuthenticatedRoute>
            </Switch>
          </div>
        </Container>
      </Router>
    </div>
  );
}

