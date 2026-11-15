import express from 'express';
import { exportTallySalesXml } from '../controllers/tallyController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/sales-xml', exportTallySalesXml);

export default router;
