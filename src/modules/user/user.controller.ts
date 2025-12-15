import { Request, Response, NextFunction } from 'express';
import { User, IUser } from './user.model';
import { AppError } from '../../utils/appError';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../middleware/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';

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

