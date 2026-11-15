import { Router } from 'express';
import { getSurveys, createSurvey, sendServiceReminder } from '../controllers/retentionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/surveys', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER', 'SALES_CONSULTANT', 'TELECALLER'), getSurveys);
router.post('/surveys', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER', 'TELECALLER'), createSurvey);
router.post('/surveys/:id/send-reminder', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'TELECALLER', 'SALES_CONSULTANT'), sendServiceReminder);

export default router;