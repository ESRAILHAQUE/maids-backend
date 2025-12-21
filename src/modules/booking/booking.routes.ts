import { Router } from 'express';
import * as bookingController from './booking.controller';
import { protect, restrictToAdmin } from '../../middleware/auth.middleware';

const router = Router();

// Public route - anyone can create a booking
router.post('/', bookingController.createBooking);

// Protected routes - require authentication
router.use(protect);

// Admin only routes
router.use(restrictToAdmin);

router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.patch('/:id/status', bookingController.updateBookingStatus);
router.patch('/:id/payment', bookingController.updatePaymentStatus);
router.patch('/:id/staff', bookingController.assignStaff);
router.patch('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);

export default router;

