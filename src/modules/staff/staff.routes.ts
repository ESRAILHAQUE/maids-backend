import { Router } from 'express';
import * as staffController from './staff.controller';
import { protect, restrictToAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(restrictToAdmin);

router.get('/', staffController.getAllStaff);
router.post('/', staffController.createStaff);
router.patch('/:id', staffController.updateStaff);
router.patch('/:id/active', staffController.setStaffActive);
router.delete('/:id', staffController.deleteStaff);

export default router;

