import { Router } from 'express';
import * as authController from './auth.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.use(protect);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);

export default router;

