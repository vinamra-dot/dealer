import { Router } from 'express';
import { getDashboardStats } from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/dashboard', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER'), getDashboardStats);

export default router;
