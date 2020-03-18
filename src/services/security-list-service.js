import RequestIDService from './request-id-service';
import { buildMsgType } from './utils';

export default class SecurityListService {
    requestIdService = new RequestIDService("security-list");
    websocketService = null;

    constructor(websocketService) {
        this.websocketService = websocketService;
    }
    
    getSecurityListDefinitions() {
        const request = {
            ...buildMsgType("SecurityListRequest"),
            SecurityReqID: this.requestIdService.generateRequestId(),
            SecurityListRequestType: "AllSecurities",
            SecAltIDGrp:[],
            SubscriptionRequestType: "Snapshot"
        };

        this.websocketService.send(request);
    }
}