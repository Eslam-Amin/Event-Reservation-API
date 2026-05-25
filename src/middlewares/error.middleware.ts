import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { config } from "../config/env.config";

class ErrorHandler {
  // Development: Send detailed error with stack trace
  private static sendErrorForDev(err: ApiError, res: Response): void {
    res.status(err.statusCode || 500).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // Production: Send sanitized error (hide internals)
  private static sendErrorForProd(err: ApiError, res: Response): void {
    // Trusted operational errors: Send message to client
    if (err.isOperational) {
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message
      });
    }
    // Programming or unknown errors: Don't leak details
    else {
      res.status(500).json({
        success: false,
        message: "Something went wrong"
      });
    }
  }

  //  Main Handler
  public static handle = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    err.statusCode = err.statusCode || 500;
    err.success = err.success || false;

    // In Development, break early and show everything
    if (config.nodeEnv === "development") {
      ErrorHandler.sendErrorForDev(err, res);
      return;
    }

    // In Production, normalize errors
    let error = { ...err };
    error.message = err.message;
    error.name = err.name; // Critical: JS spread doesn't always copy the .name property

    // Send Final Sanitized Response
    ErrorHandler.sendErrorForProd(error, res);
  };
}

export const globalErrorHandler = ErrorHandler.handle;
