import { Request, Response, NextFunction, RequestHandler } from "express";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { ApiError } from "../utils/ApiError";

export type RequestTarget = "body" | "params" | "query";

export const validateDto = (
  dtoClass: any,
  target: RequestTarget = "body"
): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Transform plain object to DTO instance
    const instance = plainToInstance(dtoClass, req[target]);

    // Validate instance
    const errors: ValidationError[] = await validate(instance, {
      whitelist: true, // Automatically strips non-decorated properties
      forbidNonWhitelisted: true // Throws error if non-decorated fields exist
    });

    if (errors.length > 0) {
      const errorMessages = errors.map((err: ValidationError) => ({
        property: err.property,
        constraints: err.constraints ? Object.values(err.constraints) : []
      }));

      return next(ApiError.badRequest("Validation failed", errorMessages));
    }

    // Replace the request object with the clean, validated instance
    req[target] = instance;
    next();
  };
};
