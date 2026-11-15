import { Router } from 'express';
import { listUsedCars, evaluateUsedCar, adjustExchangeInBooking } from '../controllers/usedCarController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', listUsedCars);
router.post('/evaluate', evaluateUsedCar);
router.patch('/:id/adjust', adjustExchangeInBooking);

export default router;
