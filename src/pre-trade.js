import React, { useState, useEffect } from 'react';

export default function PreTrade(props) {
  const { quoteMessage, service, isEstablish } = props;
  const [ symbolInputValue, setSymbolInputValue ] = useState('');
  const [ quotes, setQuotes ] = useState({});
  const [ quoteId, setQuoteId ] = useState('0');
  const [ serverTimeDiff, setServerTimeDiff ] = useState(null);
  const [ pricingServerTimeDiff, setPricingServerTimeDiff ] = useState(null);

  useEffect(() => {
    if (quoteMessage && quoteMessage.BidID && quoteMessage.OfferID) {
      setPerformanceMetrics(quoteMessage);
      const symbol = quoteMessage.Symbol;

      const newQuotes = { ...quotes };
      newQuotes[symbol] = quoteMessage;
      setQuotes({ ...newQuotes });
    }
  }, [ quoteMessage ]);

  function handleSymbolToSubscribe(event) {
    setSymbolInputValue(event.target.value)
  }

  function handleSubscription() {
    if (isEstablish) {
      const newQuoteId = String(parseInt(quoteId) + 1);
      setQuoteId(newQuoteId);
      service.subscribeToSymbol(symbolInputValue, newQuoteId);
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

  return (
    <div>
      {isEstablish ? (
        <div>
          <div>
            <h3>Show quotes for symbol</h3>
            <div>Symbol</div>
            <input type="text" value={symbolInputValue} onInput={handleSymbolToSubscribe} onChange={handleSymbolToSubscribe}/>
            <input type="button" value="Subscribe" onClick={handleSubscription} />
          </div>

          {serverTimeDiff != null && pricingServerTimeDiff != null &&
          <div>
            <div>Transit times: </div>
            <div>Server(ms): {serverTimeDiff} Pricing(ms): {pricingServerTimeDiff}</div>
          </div>
          }
          {Object.keys(quotes).map(quoteId => 
            <div key={quoteId}>Prices for {quoteId}: Bid: {quotes[quoteId].BidPx} Offer: {quotes[quoteId].OfferPx}</div>
          )}
        </div>
      ) :
          (
            <div>Login to subscribe to symbols</div>
          )}
    </div>
  );
}
