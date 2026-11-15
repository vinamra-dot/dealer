import { Router } from 'express';
import { listBookings, createBooking, updateBookingStatus, cancelBooking, swapChassis } from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', listBookings);
router.post('/punch-otf', createBooking);
router.patch('/:id/status', updateBookingStatus);
router.post('/:id/swap-chassis', swapChassis);
router.post('/:id/cancel', cancelBooking);

export default router;
