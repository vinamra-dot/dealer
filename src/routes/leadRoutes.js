import { Router } from 'express';
import { listLeads, createLead, updateLeadStatus, bulkImportLeads } from '../controllers/leadController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', listLeads);
router.post('/', createLead);
router.post('/bulk-import', bulkImportLeads);
router.patch('/:id/status', updateLeadStatus);

export default router;
