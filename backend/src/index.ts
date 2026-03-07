import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import requestRoutes from './routes/requestRoutes';
import parkRoutes from './routes/parkRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import notificationRoutes from './routes/notificationRoutes';
import typeRoutes from './routes/typeRoutes';
import vendorRoutes from './routes/vendorRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/parks', parkRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/vendors', vendorRoutes);

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