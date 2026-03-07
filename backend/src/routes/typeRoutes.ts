import { Router } from 'express';
import { getEquipmentTypes, createEquipmentType, updateEquipmentType } from '../controllers/typeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getEquipmentTypes);
router.post('/', authenticate, authorize(['LOGISTICA', 'ADMIN']), createEquipmentType);
router.put('/:id', authenticate, authorize(['LOGISTICA', 'ADMIN']), updateEquipmentType);

export default router;
