import { Router } from 'express';
import { getEquipment, createEquipment, updateEquipment, getEquipmentById, exportEquipment } from '../controllers/equipmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getEquipment);
router.get('/export', authenticate, exportEquipment);
router.get('/:id', authenticate, getEquipmentById);
router.post('/', authenticate, authorize(['LOGISTICA', 'ADMIN']), createEquipment);
router.put('/:id', authenticate, authorize(['LOGISTICA', 'ADMIN']), updateEquipment);

export default router;
