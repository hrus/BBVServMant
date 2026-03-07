"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getNotifications = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getNotifications = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const notifications = await prisma_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching notifications' });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    const id = req.params.id;
    try {
        await prisma_1.default.notification.update({
            where: { id },
            data: { read: true }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Error marking notification as read' });
    }
};
exports.markAsRead = markAsRead;
