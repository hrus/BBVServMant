import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const getNotifications = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notifications' });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        await prisma.notification.update({
            where: { id },
            data: { read: true }
        });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: 'Error marking notification as read' });
    }
};
