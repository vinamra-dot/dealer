import { Router } from 'express';
import { listFinanceRecords, logFinanceRecord, recordPayment, listPayments } from '../controllers/financeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'FINANCE_HEAD'));
router.get('/records', listFinanceRecords);
router.post('/record-do', logFinanceRecord);
router.get('/payments', listPayments);
router.post('/record-payment', recordPayment);

export default router;
