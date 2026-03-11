import { Router } from 'express';
import { getVendors, createVendor, updateVendor, deleteVendor } from '../controllers/vendorController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize(['LOGISTICA', 'ADMIN']), getVendors);
router.post('/', authenticate, authorize(['LOGISTICA', 'ADMIN']), createVendor);
router.put('/:id', authenticate, authorize(['LOGISTICA', 'ADMIN']), updateVendor);
router.delete('/:id', authenticate, authorize(['LOGISTICA', 'ADMIN']), deleteVendor);



export default router;
