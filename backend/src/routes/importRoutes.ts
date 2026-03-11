import { Router } from 'express';
import multer from 'multer';
import { importUsers, importEquipment } from '../controllers/importController';
import { authenticate, authorize } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.csv') {
            return cb(new Error('Solo se permiten archivos CSV'));
        }
        cb(null, true);
    }
});

// All import routes are admin only
router.post('/users', authenticate, authorize(['ADMIN']), upload.single('file'), importUsers);
router.post('/equipment', authenticate, authorize(['ADMIN']), upload.single('file'), importEquipment);

export default router;
