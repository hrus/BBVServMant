import { Router } from 'express';
import { 
    getVendorEquipmentServices, 
    createVendorEquipmentService, 
    deleteVendorEquipmentService,
    setServicesForVendorType
} from '../controllers/vendorServiceController';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticate, getVendorEquipmentServices);
router.post('/', authenticate, authorize([Role.ADMIN]), createVendorEquipmentService);
router.delete('/:id', authenticate, authorize([Role.ADMIN]), deleteVendorEquipmentService);
router.post('/set-services', authenticate, authorize([Role.ADMIN]), setServicesForVendorType);

export default router;
