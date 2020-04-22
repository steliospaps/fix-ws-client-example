import RequestIDService from "./request-id-service";
import {buildMsgType, generateSendingTime} from "./utils";
import {SUBSCRIPTION_REQUEST_TYPE} from "./websocket-connection";

export default class OrderService {
    websocketService = null;
    orderIdService = new RequestIDService("order");
    orderStatusIdService = new RequestIDService("order-status");

    constructor(tradeWebsocket) {
        this.websocketService = tradeWebsocket;
    }

    placeOrder({ account, securityId, side, orderQty, orderType, price, currency, timeInForce, stopPx, expiry }) {
        const clOrdID = this.orderIdService.generateRequestId();
        let request = {
            ...buildMsgType("NewOrderSingle"),
            CstmApplVerID: "IGUS/Trade/V1",
            ClOrdID: clOrdID,
            Account: account,
            SecurityID: securityId,
            SecurityIDSource: "MarketplaceAssignedIdentifier",
            Side: side,
            TransactTime: generateSendingTime(),
            OrderQty: orderQty,
            OrdType: orderType,
            Currency: currency,
            TimeInForce: timeInForce,
        };

        if (price) {
            request.Price = price;
        }

        if(stopPx) {
            request.StopPx = stopPx;
        }

        if (expiry) {
          request.ExpireTime = expiry;
        }

        this.websocketService.send(request);
        return clOrdID;
    }

    getOrderMassStatus({ account }) {
        const MassStatusReqID = this.orderStatusIdService.generateRequestId();
        const request = {
            ...buildMsgType("OrderMassStatusRequest"),
            MassStatusReqType: "StatusForOrdersForAPartyID",
            SubscriptionRequestType: SUBSCRIPTION_REQUEST_TYPE.SUBSCRIBE,
            MassStatusReqID,
            Account: account
        };

        this.websocketService.send(request);
    }
}
