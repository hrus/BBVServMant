import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const getVendorEquipmentServices = async (req: AuthRequest, res: Response) => {
    try {
        const mappings = await prisma.vendorEquipmentService.findMany({
            include: {
                vendor: true,
                equipmentType: true,
                serviceType: true
            }
        });
        res.json(mappings);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching service mappings' });
    }
};

export const createVendorEquipmentService = async (req: AuthRequest, res: Response) => {
    const { vendorId, equipmentTypeId, serviceTypeId } = req.body;
    try {
        const mapping = await prisma.vendorEquipmentService.create({
            data: { vendorId, equipmentTypeId, serviceTypeId },
            include: {
                vendor: true,
                equipmentType: true,
                serviceType: true
            }
        });
        res.status(201).json(mapping);
    } catch (error) {
        res.status(400).json({ error: 'Error creating mapping' });
    }
};

export const deleteVendorEquipmentService = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        await prisma.vendorEquipmentService.delete({ where: { id } });
        res.json({ message: 'Mapping deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Error deleting mapping' });
    }
};

// Batch update/set for a specific vendor and equipment type
export const setServicesForVendorType = async (req: AuthRequest, res: Response) => {
    const { vendorId, equipmentTypeId, serviceTypeIds } = req.body;
    try {
        // Use transaction to ensure consistency
        const result = await prisma.$transaction(async (tx) => {
            // Remove existing mappings for this pair
            await tx.vendorEquipmentService.deleteMany({
                where: { vendorId, equipmentTypeId }
            });

            // Create new ones
            if (serviceTypeIds && serviceTypeIds.length > 0) {
                const data = serviceTypeIds.map((stId: string) => ({
                    vendorId,
                    equipmentTypeId,
                    serviceTypeId: stId
                }));
                await tx.vendorEquipmentService.createMany({ data });
            }

            return tx.vendorEquipmentService.findMany({
                where: { vendorId, equipmentTypeId },
                include: { serviceType: true }
            });
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error updating services for vendor/type' });
    }
};
