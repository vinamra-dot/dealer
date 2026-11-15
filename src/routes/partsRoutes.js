import { Router } from 'express';
import { getParts, createPart, issuePart } from '../controllers/partsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'LOGISTICS_PDI', 'DRIVER'), getParts);
router.post('/', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'LOGISTICS_PDI'), createPart);
router.patch('/:id/issue', authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER', 'LOGISTICS_PDI'), issuePart);

export default router;