import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../modules/user/user.model';
import { AppError } from '../utils/appError';
import { env } from '../config/env';
import { asyncHandler } from './asyncHandler';

/**
 * Authenticated Request Interface
 */
export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * JWT Payload Interface
 */
interface JwtPayload {
  id: string;
}

/**
 * Authentication Middleware
 * Protects routes by verifying JWT token
 */
export const protect = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    // Skip authentication for OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      return next();
    }

    let token: string | undefined;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      return next(new AppError('Invalid or expired token. Please log in again.', 401));
    }
  }
);

/**
 * Admin Authorization Middleware
 * Restricts access to admin users only
 * Must be used after protect middleware
 */
export const restrictToAdmin = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    if (req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  }
);

