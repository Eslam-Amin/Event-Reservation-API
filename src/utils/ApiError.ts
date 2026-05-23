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
}
