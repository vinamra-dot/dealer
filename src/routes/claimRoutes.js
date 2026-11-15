import { Router } from 'express';
import { listClaims, generateBookingClaims, updateClaimStatus } from '../controllers/claimController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'FINANCE_HEAD'));
router.get('/', listClaims);
router.post('/auto-generate', generateBookingClaims);
router.patch('/:id/status', updateClaimStatus);

export default router;
