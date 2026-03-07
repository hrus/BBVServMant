import { Router } from 'express';
import { createRequest, updateRequestStatus, getRequests } from '../controllers/requestController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getRequests);
router.post('/', authenticate, createRequest);
router.patch('/:id/status', authenticate, updateRequestStatus);

export default router;
