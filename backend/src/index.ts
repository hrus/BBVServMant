import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import requestRoutes from './routes/requestRoutes';
import parkRoutes from './routes/parkRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import notificationRoutes from './routes/notificationRoutes';
import typeRoutes from './routes/typeRoutes';
import vendorRoutes from './routes/vendorRoutes';
import serviceTypeRoutes from './routes/serviceTypeRoutes';
import vendorServiceRoutes from './routes/vendorServiceRoutes';
import importRoutes from './routes/importRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares de seguridad
app.use(helmet());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // Límite de 1000 peticiones por ventana por IP para evitar denegación de servicio general
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Demasiadas peticiones desde esta IP, por favor inténtalo de nuevo después de 15 minutos'
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // Límite más estricto para rutas de autenticación (fuerza bruta)
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Demasiados intentos de inicio de sesión, por favor inténtalo de nuevo después de 15 minutos'
});

app.use(cors());
app.use(express.json());

// Aplicar rate limits
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);


app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/parks', parkRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/service-types', serviceTypeRoutes);
app.use('/api/service-mappings', vendorServiceRoutes);
app.use('/api/import', importRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'PPE Maintenance Tracking API is running' });
});

console.log('Attempting to start server...');
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Final check