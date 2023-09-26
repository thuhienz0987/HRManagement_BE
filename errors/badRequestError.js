module.exports = class BadRequestError extends Error {
	constructor(message) {
		super()
        this.status = 400
		this.messageObject = message;
	};
};