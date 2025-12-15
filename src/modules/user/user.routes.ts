import { Router } from 'express';
import * as userController from './user.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/me', userController.getCurrentUser);
router.patch('/me', userController.updateUserProfile);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.delete('/:id', userController.deleteUser);

export default router;

