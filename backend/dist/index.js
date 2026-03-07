"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const equipmentRoutes_1 = __importDefault(require("./routes/equipmentRoutes"));
const requestRoutes_1 = __importDefault(require("./routes/requestRoutes"));
const parkRoutes_1 = __importDefault(require("./routes/parkRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const typeRoutes_1 = __importDefault(require("./routes/typeRoutes"));
const vendorRoutes_1 = __importDefault(require("./routes/vendorRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', authRoutes_1.default);
app.use('/api/equipment', equipmentRoutes_1.default);
app.use('/api/requests', requestRoutes_1.default);
app.use('/api/parks', parkRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/types', typeRoutes_1.default);
app.use('/api/vendors', vendorRoutes_1.default);
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
