import { Router } from 'express';
import * as userController from './user.controller';
import { protect, restrictToAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.use(protect);

// User routes (authenticated users)
router.get('/me', userController.getCurrentUser);
router.patch('/me', userController.updateUserProfile);

// Admin routes
router.use(restrictToAdmin);

router.get('/', userController.getAllUsers);
router.get('/pending', userController.getPendingUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id/approve', userController.approveUser);
router.patch('/:id/suspend', userController.suspendUser);
router.patch('/:id/unsuspend', userController.unsuspendUser);
router.patch('/:id/ban', userController.banUser);
router.patch('/:id/activate', userController.activateUser);
router.patch('/:id/deactivate', userController.deactivateUser);
router.delete('/:id', userController.deleteUser);

export default router;

