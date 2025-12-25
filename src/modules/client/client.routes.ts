import { Router } from 'express';
import { getClientSummaries } from './client.controller';
import { protect, restrictToAdmin } from '../../middleware/auth.middleware';

const router = Router();

// Admin-only (guarded)
router.use(protect);
router.use(restrictToAdmin);

router.get('/summary', getClientSummaries);

export default router;

