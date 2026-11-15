import { Router } from 'express';
import { handleRazorpayWebhook, sendMetaWhatsapp, sendTransactionalSms, getIntegrationStatus } from '../controllers/webhookController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public webhook endpoint for Razorpay / Cashfree / PineLabs
router.post('/razorpay', handleRazorpayWebhook);

// Protected integration endpoints
router.post('/whatsapp/send', authenticate, sendMetaWhatsapp);
router.post('/sms/send', authenticate, sendTransactionalSms);
router.get('/status', authenticate, getIntegrationStatus);

export default router;