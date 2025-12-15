import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../user/user.model';
import { AppError } from '../../utils/appError';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../middleware/asyncHandler';
import { env } from '../../config/env';
import { AuthRequest } from '../../middleware/auth.middleware';

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpire,
  } as SignOptions);
};

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password', 400));
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    const token = generateToken(user._id.toString());
    const userResponse = user.toJSON();

    sendSuccess(res, { user: userResponse, token }, 'User registered successfully', 201);
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    const token = generateToken(user._id.toString());
    const userResponse = user.toJSON();
    delete (userResponse as any).password;

    sendSuccess(res, { user: userResponse, token }, 'Login successful');
  }
);

export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) return next(new AppError('User not found', 404));
    sendSuccess(res, user, 'User profile retrieved successfully');
  }
);

export const logout = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    sendSuccess(res, null, 'Logged out successfully');
  }
);

