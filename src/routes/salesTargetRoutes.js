import { Router } from 'express';
import { listSalesTargets, updateSalesTarget } from '../controllers/salesTargetController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', listSalesTargets);
router.patch('/:id', updateSalesTarget);

export default router;
