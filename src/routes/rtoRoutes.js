import { Router } from 'express';
import { lookupVahanRto, verifyPanNsdl } from '../controllers/rtoController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.post('/vahan-lookup', lookupVahanRto);
router.post('/pan-verify', verifyPanNsdl);

export default router;