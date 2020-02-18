import React, { useState, useEffect } from 'react';
import { FormInput, Button, Row, Col, Container } from 'shards-react';

import Quote from './quote';
import Charts from './charts';
import QuoteService from '../services/quote-service';
import { SUBSCRIPTION_REQUEST_TYPE } from '../services/ig-websocket-service';
import '../styles/pre-trade.css';

const DEFAULT_SYMBOL_SUBSCRIPTIONS = [
  'GBP/USD',
  'USD/CAD',
  'USD/NOK',
  'USD/JPY',
];

export default function PreTrade({ quoteMessage, service, isEstablish, candleData, candleSubscriptionData }) {
  const [ symbolInputValue, setSymbolInputValue ] = useState('');
  const [ quotes, setQuotes ] = useState({});
  const [ serverTimeDiff, setServerTimeDiff ] = useState(null);
  const [ pricingServerTimeDiff, setPricingServerTimeDiff ] = useState(null);
  const [ symbol, setSymbol ] = useState(null);
  const [ direction, setDirection ] = useState(null);
  const [ containerWidth, setContainerWidth ] = useState(null);
  const [ selectedClass, setSelectedClass ] = useState(null);
  const [ quoteService, setQuoteService ] = useState(null);

  useEffect(() => {
    if (!quoteService) {
      setQuoteService(new QuoteService(service));
    }
  }, [quoteService, setQuoteService, service]);

  useEffect(() => {
    const preTradeContainer = document.querySelector('.pre-trade-container');
    setContainerWidth(preTradeContainer.getBoundingClientRect().width);
    const handleResize = () => {
      setContainerWidth(preTradeContainer.getBoundingClientRect().width);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize, true);
    }
  }, []);

  useEffect(() => {
    if (isEstablish && (quoteService && quoteService.getSubscribedQuotes().length === 0)) {
      DEFAULT_SYMBOL_SUBSCRIPTIONS.forEach((symbol) => {
        const formattedSymbol = `CS.D.${symbol.replace("/", "")}.CZD.IP`;
          quoteService.getQuoteSubscription(formattedSymbol, SUBSCRIPTION_REQUEST_TYPE.SUBSCRIBE);
      });
    }

    if (quoteService && quoteService.getSubscribedQuotes().length > 0) {
      return () => {
        quoteService.getSubscribedQuotes()
          .map(request => request.symbol)
          .forEach(symbol => quoteService.getQuoteSubscription(symbol, SUBSCRIPTION_REQUEST_TYPE.UNSUBSCRIBE));
      };
    }
  }, [isEstablish, quoteService]);

  useEffect(() => {

    function hasAnyPriceTicked() {
      return hasPriceTicked("BidID") || hasPriceTicked("OfferID");
    }

    function hasPriceTicked(direction) {
      return quotes[quoteMessage.QuoteReqID][direction] !== quoteMessage[direction];
    }

    const isStreamingQuote = quoteMessage && quoteMessage.BidID && quoteMessage.OfferID;
    if (isStreamingQuote && (!(quoteMessage.QuoteReqID in quotes) ||  hasAnyPriceTicked())) {
      setPerformanceMetrics(quoteMessage);
      const quoteReqId = quoteMessage.QuoteReqID;

      const newQuotes = { ...quotes };
      newQuotes[quoteReqId] = quoteMessage;

      if (!newQuotes[quoteReqId].symbol) {
        let foundQuote = quoteService.getSubscribedQuotes().filter(requests => requests.quoteId === quoteReqId)[0];
        if (foundQuote) {
          newQuotes[quoteReqId].symbol = foundQuote.symbol;
        }
      }

      setQuotes({ ...newQuotes });
    }
  }, [quoteMessage, quotes]);

  function handleSymbolToSubscribe(event) {
    setSymbolInputValue(event.target.value)
  }

  function handleSubscription() {
    if (isEstablish) {
      quoteService.getQuoteSubscription(symbolInputValue, SUBSCRIPTION_REQUEST_TYPE.SUBSCRIBE);
    }
  }

  function setPerformanceMetrics(quoteMessage) {
    const serverTime = new Date(quoteMessage.SendingTime);
    const bidTime = new Date(parseInt(quoteMessage.BidID.substring(0, 13))).getTime();
    const offerTime = new Date(parseInt(quoteMessage.OfferID.substring(0, 13))).getTime();
    const pricingServerTime = bidTime > offerTime ? bidTime : offerTime;
    const date = new Date().getTime();
    const serverTimeDiff = date - serverTime.getTime();
    const pricingServerTimeDiff = date - pricingServerTime;
    setServerTimeDiff(serverTimeDiff);
    setPricingServerTimeDiff(pricingServerTimeDiff);
  }

  function selectChart({ direction: quoteDirection, symbol: quoteSymbol }) {
    if (direction && symbol && (direction === quoteDirection) && (symbol === quoteSymbol)) {
      setDirection(null);
      setSymbol(null)
    } else {
      setDirection(quoteDirection);
      setSymbol(quoteSymbol)
      if (quoteDirection === "BID") {
        setSelectedClass("buy-button--selected");
      } else if (quoteDirection === "ASK") {
        setSelectedClass("sell-button--selected");
      }
    }
  }

  return (
    <div className="pre-trade-container">
      <Row>
        <Col>
          <div>
            <h3>Show quotes for symbol</h3>
            <div>Symbol</div>
            <FormInput type="text" value={symbolInputValue} onInput={handleSymbolToSubscribe} onChange={handleSymbolToSubscribe}/>
            <Button className="pre-trade-button" onClick={handleSubscription}>Subscribe</Button>
          </div>
          {serverTimeDiff != null && pricingServerTimeDiff != null &&
          <div>
            <div>Transit times: </div>
            <div>Server(ms): {serverTimeDiff} Pricing(ms): {pricingServerTimeDiff}</div>
          </div>
          }
        </Col>
      </Row>
      <Row>
        <Container fluid={true}>
          <Row className={"quotes-container"}>
            {Object.keys(quotes).map(quoteId =>
            <Quote
              onDirectionClick={selectChart}
              className={(quotes[quoteId ].symbol === symbol) ? selectedClass : ''}
              key={quoteId}
              symbol={quotes[quoteId].symbol}
              buy={quotes[quoteId].BidPx}
              sell={quotes[quoteId].OfferPx}
            />
            )}
          </Row>
        </Container>
      </Row>
      {symbol && direction && 
      <Row>
        <Col>
          <Charts
            service={service}
            isLoginSuccessful={isEstablish}
            symbol={symbol}
            direction={direction}
            candleData={candleData}
            candleSubscriptionData={candleSubscriptionData.CandleData}
            containerWidth={containerWidth}
          />
        </Col>
      </Row>}
    </div>
  );
}
