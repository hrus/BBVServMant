"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequests = exports.updateRequestStatus = exports.createRequest = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const requestSchema_1 = require("../schemas/requestSchema");
const statusTransitions_1 = require("../utils/statusTransitions");
const createRequest = async (req, res) => {
    const validated = requestSchema_1.createRequestSchema.safeParse(req.body);
    if (!validated.success) {
        return res.status(400).json({ error: validated.error.issues[0].message });
    }
    const { equipmentId, serviceType, notes, pickupLocation } = validated.data;
    const requesterId = req.user?.id;
    if (!requesterId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const request = await prisma_1.default.serviceRequest.create({
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
        await prisma_1.default.log.create({
            data: {
                requestId: request.id,
                equipmentId: equipmentId,
                userId: requesterId,
                fromStatus: 'EN_PARQUE',
                toStatus: 'SOLICITUD_CREADA',
            },
        });
        res.status(201).json(request);
    }
    catch (error) {
        res.status(400).json({ error: 'Error creating request' });
    }
};
exports.createRequest = createRequest;
const updateRequestStatus = async (req, res) => {
    const id = req.params.id;
    const validated = requestSchema_1.updateStatusSchema.safeParse(req.body);
    if (!validated.success) {
        return res.status(400).json({ error: 'Estado no válido' });
    }
    const { status } = validated.data;
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const oldRequest = await prisma_1.default.serviceRequest.findUnique({ where: { id } });
        if (!oldRequest)
            return res.status(404).json({ error: 'Request not found' });
        // Validate transition
        if (!(0, statusTransitions_1.isValidTransition)(oldRequest.status, status)) {
            return res.status(400).json({ error: `Transición de ${oldRequest.status} a ${status} no permitida` });
        }
        const request = await prisma_1.default.serviceRequest.update({
            where: { id },
            data: { status },
        });
        await prisma_1.default.log.create({
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
            await prisma_1.default.equipment.update({
                where: { id: oldRequest.equipmentId },
                data: { status: 'EN_PARQUE' }
            });
        }
        else if (status === 'RECOGIDO_POR_LOGISTICA' || status === 'RETIRADO_POR_EMPRESA') {
            await prisma_1.default.equipment.update({
                where: { id: oldRequest.equipmentId },
                data: { status: 'EN_MANTENIMIENTO' }
            });
        }
        // Create notification for the requester
        if (oldRequest.requesterId !== userId) {
            await prisma_1.default.notification.create({
                data: {
                    userId: oldRequest.requesterId,
                    title: 'Estado de Solicitud Actualizado',
                    message: `Tu solicitud de ${oldRequest.serviceType} ahora está en estado: ${status.replace(/_/g, ' ')}`,
                },
            });
        }
        res.json(request);
    }
    catch (error) {
        res.status(400).json({ error: 'Error updating request status' });
    }
};
exports.updateRequestStatus = updateRequestStatus;
const getRequests = async (req, res) => {
    try {
        const filters = {};
        if (req.user?.role === 'EMPRESA_EXTERNA' && req.user.vendorId) {
            filters.equipment = { type: { vendorId: req.user.vendorId } };
        }
        const requests = await prisma_1.default.serviceRequest.findMany({
            where: filters,
            include: { equipment: { include: { type: true } }, requester: true },
        });
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching requests' });
    }
};
exports.getRequests = getRequests;
