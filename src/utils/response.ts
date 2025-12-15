import { Response } from 'express';

/**
 * API Response Utility
 * Standardized response formatting for success and error cases
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 500,
  error?: string
): Response => {
  // Ensure we don't send response if already sent
  if (res.headersSent) return res;
  const response: ApiResponse = {
    success: false,
    message,
    error: error || message,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

