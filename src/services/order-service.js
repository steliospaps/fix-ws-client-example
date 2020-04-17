import RequestIDService from "./request-id-service";
import {buildMsgType, generateSendingTime} from "./utils";

export default class OrderService {
    websocketService = null;
    orderIdService = new RequestIDService("order");

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
}
