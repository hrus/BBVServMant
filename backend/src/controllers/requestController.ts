import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { createRequestSchema, updateStatusSchema } from '../schemas/requestSchema';
import { isValidTransition } from '../utils/statusTransitions';

export const createRequest = async (req: AuthRequest, res: Response) => {
    const validated = createRequestSchema.safeParse(req.body);
    if (!validated.success) {
        return res.status(400).json({ error: validated.error.issues[0].message });
    }

    const { equipmentId, serviceType, notes, pickupLocation } = validated.data;
    const requesterId = req.user?.id;
    if (!requesterId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const request = await prisma.serviceRequest.create({
            data: {
                equipmentId,
                requesterId,
                serviceType,
                notes,
                pickupLocation,
                status: 'SOLICITUD_CREADA',
            },
        });

        // Log the initial state
        await prisma.log.create({
            data: {
                requestId: request.id,
                equipmentId: equipmentId,
                userId: requesterId,
                fromStatus: 'EN_PARQUE',
                toStatus: 'SOLICITUD_CREADA',
            },
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(400).json({ error: 'Error creating request' });
    }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const validated = updateStatusSchema.safeParse(req.body);
    if (!validated.success) {
        return res.status(400).json({ error: 'Estado no válido' });
    }

    const { status } = validated.data;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const oldRequest = await prisma.serviceRequest.findUnique({ where: { id } });
        if (!oldRequest) return res.status(404).json({ error: 'Request not found' });

        // Validate transition
        if (!isValidTransition(oldRequest.status, status)) {
            return res.status(400).json({ error: `Transición de ${oldRequest.status} a ${status} no permitida` });
        }

        const request = await prisma.serviceRequest.update({
            where: { id },
            data: { status },
        });

        await prisma.log.create({
            data: {
                requestId: id,
                equipmentId: oldRequest.equipmentId,
                userId,
                fromStatus: oldRequest.status,
                toStatus: status,
            },
        });

        // Update Equipment status based on Request status
        if (status === 'ENTREGADO') {
            await prisma.equipment.update({
                where: { id: oldRequest.equipmentId },
                data: { status: 'EN_PARQUE' }
            });
        } else if (status === 'RECOGIDO_POR_LOGISTICA' || status === 'RETIRADO_POR_EMPRESA') {
            await prisma.equipment.update({
                where: { id: oldRequest.equipmentId },
                data: { status: 'EN_MANTENIMIENTO' }
            });
        }

        // Create notification for the requester
        if (oldRequest.requesterId !== userId) {
            await prisma.notification.create({
                data: {
                    userId: oldRequest.requesterId,
                    title: 'Estado de Solicitud Actualizado',
                    message: `Tu solicitud de ${oldRequest.serviceType} ahora está en estado: ${status.replace(/_/g, ' ')}`,
                },
            });
        }

        res.json(request);
    } catch (error) {
        res.status(400).json({ error: 'Error updating request status' });
    }
};

export const getRequests = async (req: AuthRequest, res: Response) => {
    try {
        const filters: any = {};

        if (req.user?.role === 'EMPRESA_EXTERNA' && req.user.vendorId) {
            filters.equipment = { type: { vendorId: req.user.vendorId } };
        }

        const requests = await prisma.serviceRequest.findMany({
            where: filters,
            include: { equipment: { include: { type: true } }, requester: true },
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching requests' });
    }
};
