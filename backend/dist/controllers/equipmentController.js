"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportEquipment = exports.getEquipmentById = exports.updateEquipment = exports.createEquipment = exports.getEquipment = void 0;
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
    const { visualId, qrCode, rfidTag, typeId, assignmentType, ownerId, parkId, status, location } = req.body;
    try {
        const equipment = await prisma_1.default.equipment.create({
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
    }
    catch (error) {
        console.error('Error creating equipment:', error);
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
const getEquipmentById = async (req, res) => {
    const id = req.params.id;
    try {
        const equipment = await prisma_1.default.equipment.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener el detalle del equipo' });
    }
};
exports.getEquipmentById = getEquipmentById;
const exportEquipment = async (req, res) => {
    try {
        const filters = {};
        if (req.user?.role === 'EMPRESA_EXTERNA' && req.user.vendorId) {
            filters.type = { vendorId: req.user.vendorId };
        }
        const equipment = await prisma_1.default.equipment.findMany({
            where: filters,
            include: { type: { include: { vendor: true } }, owner: true, park: true },
        });
        // Convert to CSV
        const header = 'ID Visual,Tipo,Categoria,Estado,Propietario,Ubicacion,Proveedor,Codigo QR,RFID\n';
        const rows = equipment.map(e => {
            return [
                e.visualId,
                e.type.name,
                e.type.category,
                e.status,
                e.owner?.name || 'N/A',
                e.park?.name || e.location || 'N/A',
                e.type.vendor.name,
                e.qrCode || 'N/A',
                e.rfidTag || 'N/A'
            ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
        }).join('\n');
        const csv = header + rows;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=inventario_epp.csv');
        res.status(200).send(csv);
    }
    catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Error exporting equipment' });
    }
};
exports.exportEquipment = exportEquipment;
