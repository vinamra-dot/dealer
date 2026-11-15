import { Router } from 'express';
import { trackCustomerCar } from '../controllers/trackingController.js';

const router = Router();

// Public customer tracking route (No staff JWT required)
router.post('/track', trackCustomerCar);

export default router;