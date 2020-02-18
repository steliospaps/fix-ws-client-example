import * as Timestamp from 'timestamp-nano';

export const DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS";

export const SUBSCRIPTION_REQUEST_TYPE = {
  SUBSCRIBE: "SnapshotAndUpdates",
  UNSUBSCRIBE: "DisablePreviousSnapshot"
}

export default class IGWebsocketService {
  fixpWebsocket = null;
  url = "";
  sessionId = "";
  credentials = "";
  credentialsType = "";
  heartbeatInterval = null;
  heartbeatIntervalAmount = null;

  constructor(url) {
    this.url = url;
    this.fixpWebsocket = new WebSocket(url);
  }

  close() {
    this.fixpWebsocket.close();
  }

  send(data) {
    if (this.fixpWebsocket.readyState === this.fixpWebsocket.OPEN) {
      this.fixpWebsocket.send(JSON.stringify(data));
    }
  }

  sendNegotiate(sessionId, credentialsType, credentials) {
    this.sessionId = sessionId;
    this.credentials = credentials;
    this.credentialsType = credentialsType;

    const timestamp = this._generateTimestamp();

    const negotiate = {
      MessageType:"Negotiate",
      Timestamp:timestamp,
      SessionId: sessionId,
      ClientFlow:"Unsequenced",
      Credentials: {
        CredentialsType:  credentialsType,
        Token: credentials
      }
    };
    this.send(negotiate);
  }

  sendEstablish(sessionId, heartbeat) {
    const timestamp = this._generateTimestamp();
    this.heartbeatIntervalAmount = heartbeat;
    const establish = {
      MessageType:"Establish",
      Timestamp: timestamp,
      SessionId: sessionId,
      KeepaliveInterval: this.heartbeatIntervalAmount
    };
    this.send(establish);
  }

  setHeartbeatInvervalAmount(amount) {
    this.heartbeatIntervalAmount = amount;
  }

  startHeartbeat() {
    const heartbeat = {
      MessageType: "UnsequencedHeartbeat"
    };

    const heartbeatTime = Math.max(parseInt(this.heartbeatIntervalAmount), 2000) - 1000;
    this.heartbeatInterval = setInterval(() =>this.send(heartbeat), heartbeatTime);
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = null;
  }

  _generateTimestamp() {
    const date = Timestamp.fromDate(new Date());
    return parseInt(String(date.getTimeT()) + String(date.getNano()));
  }
}
