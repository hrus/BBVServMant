import { Router } from 'express';
import { createRequest, updateRequestStatus, getRequests, updateRequest, deleteRequest } from '../controllers/requestController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getRequests);
router.post('/', authenticate, authorize(['SOLICITANTE', 'LOGISTICA', 'ADMIN']), createRequest);
router.put('/:id', authenticate, authorize(['SOLICITANTE', 'LOGISTICA', 'ADMIN']), updateRequest);
router.delete('/:id', authenticate, authorize(['SOLICITANTE', 'LOGISTICA', 'ADMIN']), deleteRequest);
router.patch('/:id/status', authenticate, authorize(['LOGISTICA', 'ADMIN', 'EMPRESA_EXTERNA']), updateRequestStatus);



export default router;
