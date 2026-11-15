import { Router } from 'express';
import { listDealershipUsers, createDealershipUser, toggleUserStatus } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('SYSTEM_ADMIN', 'GENERAL_MANAGER'));
router.get('/', listDealershipUsers);
router.post('/', createDealershipUser);
router.patch('/:id/toggle', toggleUserStatus);

export default router;
