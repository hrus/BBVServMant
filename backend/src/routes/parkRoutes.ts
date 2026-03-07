import { Router } from 'express';
import { getParks, createPark, updateParkMinimums, deletePark } from '../controllers/parkController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getParks);
router.post('/', authenticate, authorize(['LOGISTICA', 'ADMIN']), createPark);
router.put('/:parkId/minimums', authenticate, authorize(['LOGISTICA', 'ADMIN']), updateParkMinimums);
router.delete('/:id', authenticate, authorize(['LOGISTICA', 'ADMIN']), deletePark);

export default router;
