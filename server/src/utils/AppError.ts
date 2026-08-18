export default class AppError extends Error {
  /** HTTP status code used for the response. */
  public readonly statusCode: number;

  /** Response status label derived from the status code. */
  public readonly status: "fail" | "error";

  /** Marks errors that are expected and safe to send to clients. */
  public readonly isOperational: boolean;

  /** Human-readable error message. */
  public override message: string;

  constructor(message: string, statusCode: number) {
    super(message);

    this.message = message;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
