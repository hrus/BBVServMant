import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const getEquipmentTypes = async (req: AuthRequest, res: Response) => {
    try {
        const types = await prisma.equipmentType.findMany({
            include: { vendor: true }
        });
        res.json(types);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching equipment types' });
    }
};

export const createEquipmentType = async (req: AuthRequest, res: Response) => {
    const { name, vendorId } = req.body;
    try {
        const type = await prisma.equipmentType.create({
            data: { name, vendorId }
        });
        res.status(201).json(type);
    } catch (error) {
        res.status(400).json({ error: 'Error creating equipment type' });
    }
};

export const updateEquipmentType = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const { name, vendorId } = req.body;
    try {
        const type = await prisma.equipmentType.update({
            where: { id },
            data: { name, vendorId }
        });
        res.json(type);
    } catch (error) {
        res.status(400).json({ error: 'Error updating equipment type' });
    }
};
