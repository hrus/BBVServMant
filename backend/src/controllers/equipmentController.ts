import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const getEquipment = async (req: AuthRequest, res: Response) => {
    try {
        const filters: any = {};

        // Vendor isolation
        if (req.user?.role === 'EMPRESA_EXTERNA' && req.user.vendorId) {
            filters.type = { vendorId: req.user.vendorId };
        }

        const equipment = await prisma.equipment.findMany({
            where: filters,
            include: { type: true, owner: true },
        });
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching equipment' });
    }
};

export const createEquipment = async (req: AuthRequest, res: Response) => {
    const { visualId, qrCode, rfidTag, typeId, assignmentType, ownerId, parkId, status, location } = req.body;
    try {
        const equipment = await prisma.equipment.create({
            data: {
                visualId,
                qrCode: qrCode || null,
                rfidTag: rfidTag || null,
                typeId,
                assignmentType: assignmentType || 'PARQUE',
                ownerId: ownerId || null,
                parkId: parkId || null,
                status: status || 'EN_PARQUE',
                location: location || null,
            },
        });
        res.status(201).json(equipment);
    } catch (error) {
        console.error('Error creating equipment:', error);
        res.status(400).json({ error: 'Error creating equipment' });
    }
};

export const updateEquipment = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const { visualId, qrCode, rfidTag, typeId, assignmentType, ownerId, parkId, status, location } = req.body;

    try {
        const equipment = await prisma.equipment.update({
            where: { id },
            data: {
                visualId,
                qrCode: qrCode || null,
                rfidTag: rfidTag || null,
                typeId,
                assignmentType: assignmentType || 'PARQUE',
                ownerId: ownerId || null,
                parkId: parkId || null,
                status: status || 'EN_PARQUE',
                location: location || null,
            },
        });
        res.json(equipment);
    } catch (error) {
        res.status(400).json({ error: 'Error updating equipment' });
    }
};

export const deleteEquipment = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        await prisma.equipment.delete({ where: { id } });
        res.json({ message: 'Equipment deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'No se puede eliminar el equipo porque tiene solicitudes o registros de historial asociados' });
        }
        res.status(400).json({ error: 'Error deleting equipment' });
    }
};


export const getEquipmentById = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        const equipment = await prisma.equipment.findUnique({
            where: { id },
            include: {
                type: {
                    include: {
                        vendor: true
                    }
                },
                owner: true,
                park: true,
                requests: {
                    include: {
                        requester: {
                            select: { name: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                logs: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    },
                    orderBy: { timestamp: 'desc' }
                }
            }
        });

        if (!equipment) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        res.json(equipment);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el detalle del equipo' });
    }
};

export const exportEquipment = async (req: AuthRequest, res: Response) => {
    try {
        const filters: any = {};
        if (req.user?.role === 'EMPRESA_EXTERNA' && req.user.vendorId) {
            filters.type = { vendorId: req.user.vendorId };
        }

        const equipment = await prisma.equipment.findMany({
            where: filters,
            include: { type: { include: { vendor: true } }, owner: true, park: true },
        });

        // Convert to CSV
        const header = 'visualId,qrCode,typeName,assignmentType,ownerEmail,parkName,status,location\n';
        const rows = equipment.map(e => {
            return [
                e.visualId,
                e.qrCode || '',
                e.type.name,
                e.assignmentType,
                e.owner?.email || '',
                e.park?.name || '',
                e.status,
                e.location || ''
            ].map(val => {
                const s = String(val || '');
                if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                    return `"${s.replace(/"/g, '""')}"`;
                }
                return s;
            }).join(',');
        }).join('\n');

        const csv = header + rows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=inventario_epp.csv');
        res.status(200).send(csv);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Error exporting equipment' });
    }
};
