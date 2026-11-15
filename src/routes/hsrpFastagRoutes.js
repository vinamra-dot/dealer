import express from 'express';
import { listComplianceFitment, mapHsrpLaserCodes, activateFastagBarcode } from '../controllers/hsrpFastagController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/', listComplianceFitment);
router.post('/hsrp-map', mapHsrpLaserCodes);
router.post('/fastag-activate', activateFastagBarcode);

export default router;
