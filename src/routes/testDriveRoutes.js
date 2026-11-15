import { Router } from 'express';
import { listTestDrives, scheduleTestDrive, approveTestDrive, completeTestDrive } from '../controllers/testDriveController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', listTestDrives);
router.post('/schedule', scheduleTestDrive);
router.patch('/:id/approve', authorize('GENERAL_MANAGER', 'SYSTEM_ADMIN'), approveTestDrive);
router.patch('/:id/complete', completeTestDrive);

export default router;
