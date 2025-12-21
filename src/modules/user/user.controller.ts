import { Request, Response, NextFunction } from 'express';
import { User, IUser } from './user.model';
import { AppError } from '../../utils/appError';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../middleware/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';
import {
  sendAccountApprovalEmail,
  sendAccountSuspensionEmail,
} from '../../utils/email';

export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    sendSuccess(res, users, 'Users retrieved successfully');
  }
);

export const getUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) return next(new AppError('User not found', 404));
    sendSuccess(res, user, 'User retrieved successfully');
  }
);

export const getCurrentUser = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) return next(new AppError('User not found', 404));
    sendSuccess(res, user, 'User profile retrieved successfully');
  }
);

export const updateUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { name, email } = req.body;
    const userId = req.user?._id;

    const updateData: Partial<IUser> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return next(new AppError('User not found', 404));
    sendSuccess(res, user, 'User profile updated successfully');
  }
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return next(new AppError('User not found', 404));
    sendSuccess(res, null, 'User deleted successfully', 204);
  }
);

/**
 * Get pending users (not verified or not active)
 */
export const getPendingUsers = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const users = await User.find({
      $or: [{ isVerified: false }, { isActive: false }],
      isDeleted: false,
    })
      .select('-password')
      .sort({ createdAt: -1 });
    sendSuccess(res, users, 'Pending users retrieved successfully');
  }
);

/**
 * Approve user account
 */
export const approveUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.isDeleted) {
      return next(new AppError('Cannot approve a deleted user', 400));
    }

    user.isVerified = true;
    user.isActive = true;
    await user.save({ validateBeforeSave: false });

    // Send approval email
    try {
      await sendAccountApprovalEmail(user.email, user.name);
    } catch (error) {
      console.error('Failed to send approval email:', error);
    }

    sendSuccess(res, user.toJSON(), 'User approved successfully');
  }
);

/**
 * Suspend user account
 */
export const suspendUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.isDeleted) {
      return next(new AppError('Cannot suspend a deleted user', 400));
    }

    if (user.role === 'admin') {
      return next(new AppError('Cannot suspend an admin user', 403));
    }

    user.isSuspended = true;
    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    // Send suspension email
    try {
      await sendAccountSuspensionEmail(user.email, user.name, reason);
    } catch (error) {
      console.error('Failed to send suspension email:', error);
    }

    sendSuccess(res, user.toJSON(), 'User suspended successfully');
  }
);

/**
 * Unsuspend user account
 */
export const unsuspendUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.isSuspended = false;
    user.isActive = true;
    await user.save({ validateBeforeSave: false });

    sendSuccess(res, user.toJSON(), 'User unsuspended successfully');
  }
);

/**
 * Ban user account (soft delete)
 */
export const banUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role === 'admin') {
      return next(new AppError('Cannot ban an admin user', 403));
    }

    user.isDeleted = true;
    user.isActive = false;
    user.isSuspended = true;
    await user.save({ validateBeforeSave: false });

    // Send suspension email (ban is similar to suspension)
    try {
      await sendAccountSuspensionEmail(user.email, user.name, reason || 'Account banned');
    } catch (error) {
      console.error('Failed to send ban email:', error);
    }

    sendSuccess(res, user.toJSON(), 'User banned successfully');
  }
);

/**
 * Activate user account
 */
export const activateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.isDeleted) {
      return next(new AppError('Cannot activate a deleted user', 400));
    }

    user.isActive = true;
    await user.save({ validateBeforeSave: false });

    sendSuccess(res, user.toJSON(), 'User activated successfully');
  }
);

/**
 * Deactivate user account
 */
export const deactivateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role === 'admin') {
      return next(new AppError('Cannot deactivate an admin user', 403));
    }

    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    sendSuccess(res, user.toJSON(), 'User deactivated successfully');
  }
);

