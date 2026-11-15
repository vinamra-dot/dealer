import express from 'express';
import { listClaims, createClaim, approveSurveyorClaim } from '../controllers/bodyShopController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/claims', listClaims);
router.post('/claims', createClaim);
router.patch('/claims/:id/surveyor-approve', approveSurveyorClaim);

export default router;
