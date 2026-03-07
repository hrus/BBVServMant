import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const getParks = async (req: AuthRequest, res: Response) => {
    try {
        const parks = await prisma.park.findMany({
            include: {
                _count: {
                    select: { equipment: true }
                },
                minStocks: true
            }
        });
        res.json(parks);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching parks' });
    }
};

export const createPark = async (req: AuthRequest, res: Response) => {
    const { name } = req.body;
    try {
        const park = await prisma.park.create({
            data: { name },
        });
        res.status(201).json(park);
    } catch (error) {
        res.status(400).json({ error: 'Error creating park' });
    }
};

export const updateParkMinimums = async (req: AuthRequest, res: Response) => {
    const parkId = req.params.parkId as string;
    const { typeId, minQuantity } = req.body;

    if (req.user?.role !== 'LOGISTICA' && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only Logistics can update minimums' });
    }

    try {
        const minStock = await prisma.parkEquipmentMin.upsert({
            where: {
                parkId_typeId: {
                    parkId,
                    typeId
                }
            },
            update: { minQuantity },
            create: {
                parkId,
                typeId,
                minQuantity
            }
        });
        res.json(minStock);
    } catch (error) {
        res.status(400).json({ error: 'Error updating minimums' });
    }
};
export const deletePark = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        // Delete related min stocks first to avoid FK constraint issues
        await prisma.parkEquipmentMin.deleteMany({
            where: { parkId: id }
        });

        await prisma.park.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting park:', error);
        res.status(400).json({ error: 'No se puede eliminar el parque. Asegúrate de que no tenga equipos asociados.' });
    }
};
