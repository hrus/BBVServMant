import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const getVendors = async (req: AuthRequest, res: Response) => {
    try {
        const vendors = await prisma.vendor.findMany();
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching vendors' });
    }
};

export const createVendor = async (req: AuthRequest, res: Response) => {
    const { name, services, contactInfo } = req.body;
    try {
        const vendor = await prisma.vendor.create({
            data: { name, services, contactInfo }
        });
        res.status(201).json(vendor);
    } catch (error) {
        res.status(400).json({ error: 'Error creating vendor' });
    }
};

export const updateVendor = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const { name, services, contactInfo } = req.body;
    try {
        const vendor = await prisma.vendor.update({
            where: { id },
            data: { name, services, contactInfo }
        });
        res.json(vendor);
    } catch (error) {
        res.status(400).json({ error: 'Error updating vendor' });
    }
};
