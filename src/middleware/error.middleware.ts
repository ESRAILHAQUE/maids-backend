import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Global Error Handling Middleware
 * Centralized error handling for all routes and controllers
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response | void => {
  // Log error details
  logger.error(`Error: ${err.message}`, err);

  // Handle known operational errors (AppError instances)
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(', ');
    return sendError(res, `Validation Error: ${message}`, 400);
  }

  // Handle Mongoose duplicate key errors
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    const message = `${field} already exists`;
    return sendError(res, message, 400);
  }

  // Handle Mongoose cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    const message = `Invalid ${(err as any).path}: ${(err as any).value}`;
    return sendError(res, message, 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Your token has expired. Please log in again.', 401);
  }

  // Handle unknown errors
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong!'
    : err.message || 'Internal server error';

  return sendError(res, message, statusCode);
};

/**
 * 404 Not Found Handler
 * Handles requests to non-existent routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
};

