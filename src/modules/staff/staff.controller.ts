import { Staff } from './staff.model';
import { AppError } from '../../utils/appError';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../middleware/asyncHandler';

// List all staff
export const getAllStaff = asyncHandler(async (_req, res) => {
    const staff = await Staff.find().sort({ active: -1, name: 1 });
    sendSuccess(res, staff, 'Staff list retrieved');
});

// Add staff
export const createStaff = asyncHandler(async (req, res, next) => {
    const { name, phone, role } = req.body;
    if (!name || !phone || !role) return next(new AppError('Name, phone, and role are required', 400));
    const created = await Staff.create({ name, phone, role });
    sendSuccess(res, created, 'Staff member created', 201);
});

// Edit staff
export const updateStaff = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, phone, role, active } = req.body;
    const updated = await Staff.findByIdAndUpdate(id, { name, phone, role, active }, { new: true, runValidators: true });
    if (!updated) return next(new AppError('Staff member not found', 404));
    sendSuccess(res, updated, 'Staff member updated');
});

// Activate/deactivate staff
export const setStaffActive = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { active } = req.body;
    const updated = await Staff.findByIdAndUpdate(id, { active: !!active }, { new: true });
    if (!updated) return next(new AppError('Staff member not found', 404));
    sendSuccess(res, updated, 'Staff member updated');
});

// Delete staff
export const deleteStaff = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const deleted = await Staff.findByIdAndDelete(id);
    if (!deleted) return next(new AppError('Staff member not found', 404));
    sendSuccess(res, deleted, 'Staff member deleted');
});

