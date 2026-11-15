import { Router } from 'express';
import authRoutes from './authRoutes.js';
import leadRoutes from './leadRoutes.js';
import testDriveRoutes from './testDriveRoutes.js';
import quoteRoutes from './quoteRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import financeRoutes from './financeRoutes.js';
import pdiRoutes from './pdiRoutes.js';
import claimRoutes from './claimRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import usedCarRoutes from './usedCarRoutes.js';
import deliveryRoutes from './deliveryRoutes.js';
import salesTargetRoutes from './salesTargetRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import userRoutes from './userRoutes.js';
import kycRoutes from './kycRoutes.js';
import workshopRoutes from './workshopRoutes.js';
import partsRoutes from './partsRoutes.js';
import retentionRoutes from './retentionRoutes.js';
import webhookRoutes from './webhookRoutes.js';
import rtoRoutes from './rtoRoutes.js';
import ledgerRoutes from './ledgerRoutes.js';
import trackingRoutes from './trackingRoutes.js';
import cronRoutes from './cronRoutes.js';
import aiBotRoutes from './aiBotRoutes.js';
import tallyRoutes from './tallyRoutes.js';
import transportGpsRoutes from './transportGpsRoutes.js';
import auctionRoutes from './auctionRoutes.js';
import bodyShopRoutes from './bodyShopRoutes.js';
import hsrpFastagRoutes from './hsrpFastagRoutes.js';
import { isDbInMemory, getLastDbError } from '../config/db.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/vehicles', vehicleRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/leads', leadRoutes);
apiRouter.use('/test-drives', testDriveRoutes);
apiRouter.use('/quotes', quoteRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/finance', financeRoutes);
apiRouter.use('/pdi', pdiRoutes);
apiRouter.use('/claims', claimRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/used-cars', usedCarRoutes);
apiRouter.use('/delivery', deliveryRoutes);
apiRouter.use('/sales-targets', salesTargetRoutes);
apiRouter.use('/kyc', kycRoutes);
apiRouter.use('/workshop', workshopRoutes);
apiRouter.use('/parts', partsRoutes);
apiRouter.use('/retention', retentionRoutes);
apiRouter.use('/webhooks', webhookRoutes);
apiRouter.use('/integrations', webhookRoutes);
apiRouter.use('/rto', rtoRoutes);
apiRouter.use('/ledger', ledgerRoutes);
apiRouter.use('/tracking', trackingRoutes);
apiRouter.use('/cron', cronRoutes);
apiRouter.use('/bot', aiBotRoutes);
apiRouter.use('/tally', tallyRoutes);
apiRouter.use('/transport', transportGpsRoutes);
apiRouter.use('/auctions', auctionRoutes);
apiRouter.use('/bodyshop', bodyShopRoutes);
apiRouter.use('/compliance', hsrpFastagRoutes);

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'DealerFlow SaaS Core Engine',
    dbMode: isDbInMemory() ? 'IN_MEMORY' : 'REMOTE_POSTGRES',
    dbError: getLastDbError(),
    timestamp: new Date().toISOString()
  });
});

export default apiRouter;