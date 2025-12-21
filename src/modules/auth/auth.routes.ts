import { Router } from 'express';
import * as authController from './auth.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.use(protect);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);

export default router;

