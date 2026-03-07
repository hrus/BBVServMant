import { Router } from 'express';
import { getEquipmentTypes, createEquipmentType, updateEquipmentType, deleteEquipmentType } from '../controllers/typeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getEquipmentTypes);
router.post('/', authenticate, authorize(['LOGISTICA', 'ADMIN']), createEquipmentType);
router.put('/:id', authenticate, authorize(['LOGISTICA', 'ADMIN']), updateEquipmentType);
router.delete('/:id', authenticate, authorize(['LOGISTICA', 'ADMIN']), deleteEquipmentType);



export default router;
