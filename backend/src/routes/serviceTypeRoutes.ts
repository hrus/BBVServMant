import { Router } from 'express';
import { 
    getServiceTypes, 
    createServiceType, 
    updateServiceType, 
    deleteServiceType 
} from '../controllers/serviceTypeController';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticate, getServiceTypes);
router.post('/', authenticate, authorize([Role.ADMIN]), createServiceType);
router.put('/:id', authenticate, authorize([Role.ADMIN]), updateServiceType);
router.delete('/:id', authenticate, authorize([Role.ADMIN]), deleteServiceType);

export default router;
