import { Router } from 'express';
import { getJobCards, createJobCard, updateJobCardStatus } from '../controllers/workshopController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/jobs', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'LOGISTICS_PDI', 'DRIVER'), getJobCards);
router.post('/jobs', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'LOGISTICS_PDI'), createJobCard);
router.patch('/jobs/:id/status', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'LOGISTICS_PDI', 'DRIVER'), updateJobCardStatus);

export default router;