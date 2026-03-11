import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const getServiceTypes = async (req: AuthRequest, res: Response) => {
    try {
        const types = await prisma.serviceType.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(types);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching service types' });
    }
};

export const createServiceType = async (req: AuthRequest, res: Response) => {
    const { name, description } = req.body;
    try {
        const serviceType = await prisma.serviceType.create({
            data: { name, description }
        });
        res.status(201).json(serviceType);
    } catch (error) {
        res.status(400).json({ error: 'Error creating service type' });
    }
};

export const updateServiceType = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const { name, description } = req.body;
    try {
        const serviceType = await prisma.serviceType.update({
            where: { id },
            data: { name, description }
        });
        res.json(serviceType);
    } catch (error) {
        res.status(400).json({ error: 'Error updating service type' });
    }
};

export const deleteServiceType = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        await prisma.serviceType.delete({ where: { id } });
        res.json({ message: 'Service type deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'No se puede eliminar el tipo de servicio porque tiene solicitudes o asignaciones asociadas' });
        }
        res.status(400).json({ error: 'Error deleting service type' });
    }
};
