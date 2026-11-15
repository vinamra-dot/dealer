import { Router } from 'express';
import { getMorningBriefing, triggerMorningBriefing } from '../controllers/cronController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/morning-briefing', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER'), getMorningBriefing);
router.post('/trigger-briefing', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER'), triggerMorningBriefing);

export default router;