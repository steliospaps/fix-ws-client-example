export default class RequestIDService {
  requestId = "0";
  type = "";

  constructor(type) {
    this.type = type;
  }

  generateRequestId() {
    this.requestId = parseInt(this.requestId) + 1;
    return String(`${this.type}-${new Date().getTime()}-${this.requestId}`);
  }
}
