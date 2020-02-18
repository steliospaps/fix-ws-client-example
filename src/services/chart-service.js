import RequestIDService from "./request-id-service";
import { buildMsgType } from './utils';
import {SUBSCRIPTION_REQUEST_TYPE} from "./ig-websocket-service";

export default class ChartService {
  chartDataRequests = [];
  requestIdService = new RequestIDService("chart");
  websocketService = null;

  constructor(websocketService) {
    this.websocketService = websocketService;
  }

  getChartDataRequests() {
    return this.chartDataRequests;
  }

  getChartDataSubscription(chartSubscriptionRequest) {
    const { symbol: Symbol, interval: Interval, type: SubscriptionRequestType } = chartSubscriptionRequest;
    let ReqID = null;
    if (SubscriptionRequestType === SUBSCRIPTION_REQUEST_TYPE.SUBSCRIBE) {
      ReqID = this.requestIdService.generateRequestId();
      this.chartDataRequests.push({ requestId: ReqID, interval: Interval, symbol: Symbol, ReqID });
    } else {
      const foundIndex = this.chartDataRequests
        .findIndex(request => request.interval === Interval && request.symbol === Symbol);
      if (foundIndex > -1){
        ReqID = this.chartDataRequests[foundIndex].ReqID;
        this.chartDataRequests.splice(foundIndex, 1);
      }
    }
    let chartDataSubscription = {
      ...buildMsgType("ChartDataSubscriptionRequest"),
      SubscriptionRequestType,
      ReqID,
      SecurityID: Symbol,
      SecurityIDSource:"MarketplaceAssignedIdentifier",
      Interval
    }
    this.websocketService.send(chartDataSubscription);
  }

  getChartsSnapshot(chartSnapshotRequest) {
    const { startDate, endDate, symbol, interval } = chartSnapshotRequest;
    const ReqID = this.requestIdService.generateRequestId();
    let chartRequest = {
      ...buildMsgType("HistoricCandleRequest"),
      ReqID,
      SecurityID: symbol,
      SecurityIDSource:"MarketplaceAssignedIdentifier",
      Interval: interval,
      StartDate: startDate,
      EndDate:endDate
    }
    this.websocketService.send(chartRequest);
  }
}
