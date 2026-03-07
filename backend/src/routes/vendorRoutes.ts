import { Router } from 'express';
import { getVendors, createVendor, updateVendor } from '../controllers/vendorController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getVendors);
router.post('/', authenticate, authorize(['LOGISTICA', 'ADMIN']), createVendor);
router.put('/:id', authenticate, authorize(['LOGISTICA', 'ADMIN']), updateVendor);

export default router;
