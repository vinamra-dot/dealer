import { Router } from 'express';
import { getKycRecords, createKycRecord, verifyKycRecord } from '../controllers/kycController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'FINANCE_HEAD', 'SALES_MANAGER', 'SALES_CONSULTANT'), getKycRecords);
router.post('/', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'FINANCE_HEAD', 'SALES_MANAGER', 'SALES_CONSULTANT'), createKycRecord);
router.patch('/:id/verify', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'FINANCE_HEAD'), verifyKycRecord);

export default router;