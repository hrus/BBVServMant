"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEquipment = exports.createEquipment = exports.getEquipment = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getEquipment = async (req, res) => {
    try {
        const filters = {};
        // Vendor isolation
        if (req.user?.role === 'EMPRESA_EXTERNA' && req.user.vendorId) {
            filters.type = { vendorId: req.user.vendorId };
        }
        const equipment = await prisma_1.default.equipment.findMany({
            where: filters,
            include: { type: true, owner: true },
        });
        res.json(equipment);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching equipment' });
    }
};
exports.getEquipment = getEquipment;
const createEquipment = async (req, res) => {
    const { visualId, qrCode, rfidTag, typeId, assignmentType, ownerId, parkId, status } = req.body;
    try {
        const equipment = await prisma_1.default.equipment.create({
            data: {
                visualId,
                qrCode,
                rfidTag,
                typeId,
                assignmentType,
                ownerId,
                parkId,
                status: status || 'EN_PARQUE',
            },
        });
        res.status(201).json(equipment);
    }
    catch (error) {
        res.status(400).json({ error: 'Error creating equipment' });
    }
};
exports.createEquipment = createEquipment;
const updateEquipment = async (req, res) => {
    const id = req.params.id;
    const { ownerId, parkId, status, assignmentType } = req.body;
    try {
        const equipment = await prisma_1.default.equipment.update({
            where: { id },
            data: {
                ownerId,
                parkId,
                status,
                assignmentType
            },
        });
        res.json(equipment);
    }
    catch (error) {
        res.status(400).json({ error: 'Error updating equipment' });
    }
};
exports.updateEquipment = updateEquipment;
