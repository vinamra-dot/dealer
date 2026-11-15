import { Router } from 'express';
import { listLeads, createLead, updateLeadStatus } from '../controllers/leadController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', listLeads);
router.post('/', createLead);
router.patch('/:id/status', updateLeadStatus);

export default router;
