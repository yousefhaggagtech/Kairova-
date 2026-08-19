export default class AppError extends Error {
    /** HTTP status code used for the response. */
    statusCode;
    /** Response status label derived from the status code. */
    status;
    /** Marks errors that are expected and safe to send to clients. */
    isOperational;
    /** Human-readable error message. */
    message;
    constructor(message, statusCode) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
