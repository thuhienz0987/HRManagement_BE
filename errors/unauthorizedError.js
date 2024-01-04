export default class UnauthorizedError extends Error {
  constructor(message) {
    super();
    this.status = 401;
    this.messageObject = message;
  }
}
