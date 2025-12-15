import { Router } from 'express';
import { env } from '../config/env';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';

const router = Router();
const apiVersion = env.apiVersion;

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

router.use(`/${apiVersion}/auth`, authRoutes);
router.use(`/${apiVersion}/users`, userRoutes);

export default router;
