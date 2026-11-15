import express from 'express';
import { listAuctions, placeAuctionBid, acceptAuctionBid } from '../controllers/auctionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/', listAuctions);
router.post('/:id/bid', placeAuctionBid);
router.patch('/:id/accept', acceptAuctionBid);

export default router;
