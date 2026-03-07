import { Router } from 'express';
import { getCoordinatorDashboard } from '../controllers/dashboardController';
import { getDashboardStats } from '../controllers/statsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, getDashboardStats);
router.get('/coordinator', authenticate, authorize(['COORDINADOR_INTERVENCION', 'ADMIN']), getCoordinatorDashboard);

export default router;
