export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public details: unknown;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    details?: unknown,
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
