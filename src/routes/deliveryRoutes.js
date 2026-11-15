import { Router } from 'express';
import { listHandovers, completeHandover } from '../controllers/deliveryController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', listHandovers);
router.post('/complete-vip', completeHandover);

export default router;
