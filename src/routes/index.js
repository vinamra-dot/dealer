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
import { isDbInMemory, getLastDbError } from '../config/db.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/vehicles', vehicleRoutes);
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
