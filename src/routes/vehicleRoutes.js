import { Router } from 'express';
import { listVehicles } from '../controllers/vehicleController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', listVehicles);

export default router;
