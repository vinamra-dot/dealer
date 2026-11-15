import { Router } from 'express';
import { listQuotes, createQuote } from '../controllers/quoteController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', listQuotes);
router.post('/generate', createQuote);

export default router;
