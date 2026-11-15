import { Router } from 'express';
import { listGatepasses, createGatepass, completeGatepass } from '../controllers/pdiController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'LOGISTICS_PDI', 'DRIVER'));
router.get('/gatepasses', listGatepasses);
router.post('/issue-pass', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'LOGISTICS_PDI'), createGatepass);
router.patch('/gatepasses/:id/complete', completeGatepass);

export default router;
