import { Router } from 'express';
import { login, register, getUsers, updateUser, deleteUser } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/users', authenticate, authorize(['LOGISTICA', 'ADMIN']), getUsers);
router.put('/users/:id', authenticate, authorize(['LOGISTICA', 'ADMIN']), updateUser);
router.delete('/users/:id', authenticate, authorize(['ADMIN']), deleteUser);

export default router;
