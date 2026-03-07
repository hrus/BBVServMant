import { Router } from 'express';
import { getEquipment, createEquipment, updateEquipment, deleteEquipment, getEquipmentById, exportEquipment } from '../controllers/equipmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getEquipment);
router.get('/export', authenticate, exportEquipment);
router.get('/:id', authenticate, getEquipmentById);
router.post('/', authenticate, authorize(['SOLICITANTE', 'LOGISTICA', 'ADMIN']), createEquipment);
router.put('/:id', authenticate, authorize(['SOLICITANTE', 'LOGISTICA', 'ADMIN']), updateEquipment);
router.delete('/:id', authenticate, authorize(['SOLICITANTE', 'LOGISTICA', 'ADMIN']), deleteEquipment);



export default router;
