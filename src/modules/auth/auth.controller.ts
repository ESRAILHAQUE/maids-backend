import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../user/user.model';
import { AppError } from '../../utils/appError';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../middleware/asyncHandler';
import { env } from '../../config/env';
import { AuthRequest } from '../../middleware/auth.middleware';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../../utils/email';

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpire,
  } as SignOptions);
};

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password', 400));
    }

    // Prevent admin role creation through registration
    if (role === 'admin') {
      return next(new AppError('Admin accounts cannot be created through registration', 403));
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || undefined,
      role: 'user', // Force user role
      isVerified: false,
      isSuspended: false,
      isDeleted: false,
      isActive: true,
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (error) {
      // If email fails, still create user but log the error
      // In production, you might want to handle this differently
      console.error('Failed to send verification email:', error);
    }

    const userResponse = user.toJSON();

    sendSuccess(
      res,
      { user: userResponse },
      'Registration successful. Please check your email to verify your account.',
      201
    );
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

    // Check if account is deleted
    if (user.isDeleted) {
      return next(new AppError('This account has been deleted', 403));
    }

    // Check if account is suspended
    if (user.isSuspended) {
      return next(new AppError('This account has been suspended. Please contact support.', 403));
    }

    // Check if account is active
    if (!user.isActive) {
      return next(new AppError('This account is inactive. Please contact support.', 403));
    }

    // Check if email is verified
    if (!user.isVerified) {
      return next(new AppError('Please verify your email address before logging in', 403));
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

/**
 * Verify email address
 */
export const verifyEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return next(new AppError('Verification token is required', 400));
    }

    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with this token and not expired
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired verification token', 400));
    }

    // Verify the user
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    sendSuccess(res, { user: user.toJSON() }, 'Email verified successfully');
  }
);

/**
 * Resend verification email
 */
export const resendVerificationEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.isVerified) {
      return next(new AppError('Email is already verified', 400));
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
      sendSuccess(res, null, 'Verification email sent successfully');
    } catch (error) {
      return next(new AppError('Failed to send verification email', 500));
    }
  }
);

/**
 * Forgot password - send reset email
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not for security
      sendSuccess(res, null, 'If the email exists, a password reset link has been sent');
      return;
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
      sendSuccess(res, null, 'If the email exists, a password reset link has been sent');
      return;
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Failed to send password reset email', 500));
    }
  }
);

/**
 * Reset password
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { token, password } = req.body;

    if (!token || !password) {
      return next(new AppError('Token and password are required', 400));
    }

    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with this token and not expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password');

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Generate new token for automatic login
    const jwtToken = generateToken(user._id.toString());
    const userResponse = user.toJSON();
    delete (userResponse as any).password;

    sendSuccess(res, { user: userResponse, token: jwtToken }, 'Password reset successfully');
  }
);

