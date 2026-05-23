export class ApiError extends Error {
  statusCode: number;
  success: boolean;
  errors?: any[];
  isOperational: boolean;
  code?: string | number;
  keyValue?: Record<string, any>;
  path?: string;
  value?: any;

  constructor(statusCode: number, message: string, errors: any[] = []) {
    super(message);
    this.isOperational = true;
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string = "Bad Request", errors: any[] = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message: string = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message: string = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message: string = "Not Found") {
    return new ApiError(404, message);
  }

  static conflict(message: string = "Conflict Error") {
    return new ApiError(409, message);
  }

  static internal(message: string = "Internal Server Error") {
    return new ApiError(500, message);
  }
}
