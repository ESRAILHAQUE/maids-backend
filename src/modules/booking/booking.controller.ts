import { Request, Response, NextFunction } from 'express';
import { Booking } from './booking.model';
import { AppError } from '../../utils/appError';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../middleware/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';

/**
 * Create a new booking
 */
export const createBooking = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const {
            service,
            hours,
            cleaners,
            materials,
            date,
            time,
            area,
            address,
            client,
            notes,
            totalQAR,
        } = req.body;

        // Validate required fields
        if (!service || !hours || !cleaners || !materials || !date || !time || !area || !client || !totalQAR) {
            return next(new AppError('Missing required booking fields', 400));
        }

        if (!client.name || !client.phone) {
            return next(new AppError('Client name and phone are required', 400));
        }

        // Create booking
        const booking = await Booking.create({
            service,
            hours,
            cleaners,
            materials,
            date,
            time,
            area,
            address: address || {},
            client,
            notes,
            totalQAR,
            status: 'pending',
            payment: {
                status: 'unpaid',
            },
            assignedStaffIds: [],
            userId: (req as AuthRequest).user?._id,
        });

        sendSuccess(res, booking, 'Booking created successfully', 201);
    }
);

/**
 * Get all bookings (admin only)
 */
export const getAllBookings = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const { status, payment, search } = req.query;

        const query: any = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (payment && payment !== 'all') {
            query['payment.status'] = payment;
        }

        if (search && typeof search === 'string') {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { 'client.name': searchRegex },
                { 'client.phone': searchRegex },
                { 'client.email': searchRegex },
                { service: searchRegex },
                { area: searchRegex },
                { 'payment.invoiceId': searchRegex },
            ];
        }

        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .populate('userId', 'name email')
            .lean();

        sendSuccess(res, bookings, 'Bookings retrieved successfully');
    }
);

/**
 * Get booking by ID
 */
export const getBookingById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;

        const booking = await Booking.findById(id).populate('userId', 'name email');

        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }

        sendSuccess(res, booking, 'Booking retrieved successfully');
    }
);

/**
 * Update booking status
 */
export const updateBookingStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].includes(status)) {
            return next(new AppError('Invalid status', 400));
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }

        sendSuccess(res, booking, 'Booking status updated successfully');
    }
);

/**
 * Update payment status
 */
export const updatePaymentStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const { status, method, invoiceId } = req.body;

        if (!status || !['unpaid', 'paid', 'refunded'].includes(status)) {
            return next(new AppError('Invalid payment status', 400));
        }

        const updateData: any = {
            'payment.status': status,
        };

        if (method) {
            updateData['payment.method'] = method;
        }

        if (invoiceId) {
            updateData['payment.invoiceId'] = invoiceId;
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }

        sendSuccess(res, booking, 'Payment status updated successfully');
    }
);

/**
 * Assign staff to booking
 */
export const assignStaff = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const { staffIds } = req.body;

        if (!Array.isArray(staffIds)) {
            return next(new AppError('staffIds must be an array', 400));
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            { assignedStaffIds: staffIds },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }

        sendSuccess(res, booking, 'Staff assigned successfully');
    }
);

/**
 * Update booking
 */
export const updateBooking = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated directly
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const booking = await Booking.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }

        sendSuccess(res, booking, 'Booking updated successfully');
    }
);

/**
 * Delete booking
 */
export const deleteBooking = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;

        const booking = await Booking.findByIdAndDelete(id);

        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }

        sendSuccess(res, null, 'Booking deleted successfully', 204);
    }
);

