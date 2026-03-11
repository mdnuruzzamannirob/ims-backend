import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../core/errors";
import logger from "../core/logger";
import config from "../config";

const globalErrorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    logger.warn(err.message, { statusCode: err.statusCode, stack: err.stack });
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(config.env === "development" && { stack: err.stack }),
    });
    return;
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0];
    res.status(409).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
    return;
  }

  logger.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(config.env === "development" && { stack: err.stack }),
  });
};

export default globalErrorHandler;
