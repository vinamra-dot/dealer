import { Router } from 'express';
import { getDealershipLedger } from '../controllers/ledgerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'FINANCE_HEAD', 'SALES_MANAGER'), getDealershipLedger);

export default router;