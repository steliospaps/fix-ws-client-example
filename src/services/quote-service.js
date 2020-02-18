import { buildMsgType } from './utils';
import RequestIDService from './request-id-service';
import { SUBSCRIPTION_REQUEST_TYPE } from './ig-websocket-service';

export default class QuoteService {
  subscribedQuotes = [];
  websocketService = null;
  quoteIdService = new RequestIDService("quote");

  constructor(websocketService) {
    this.websocketService = websocketService;
  }

  getSubscribedQuotes() {
    return this.subscribedQuotes;
  }

  getQuoteSubscription(symbol, type) {
    let quoteId = null;
    if (type === SUBSCRIPTION_REQUEST_TYPE.SUBSCRIBE) {
      quoteId = this.quoteIdService.generateRequestId();
      this.subscribedQuotes.push({ symbol, quoteId });
    } else if (type === SUBSCRIPTION_REQUEST_TYPE.UNSUBSCRIBE) {
      const foundIndex = this.getSubscribedQuotes()
        .findIndex(request => request.symbol === symbol);
      if (foundIndex > -1) {
        quoteId = this.subscribedQuotes[foundIndex].quoteId;
        this.getSubscribedQuotes().splice(foundIndex, 1);
      }
    }
    const quoteRequest = {
      ...buildMsgType("QuoteRequest"),
      QuoteReqID: quoteId,
      SubscriptionRequestType: type,
      QuotReqGrp: [
        {
          SecurityID: symbol,
          SecurityIDSource:"MarketplaceAssignedIdentifier"
        }
      ]
    };

    this.websocketService.send(quoteRequest);
  }

}
