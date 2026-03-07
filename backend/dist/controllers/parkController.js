"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePark = exports.updateParkMinimums = exports.createPark = exports.getParks = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getParks = async (req, res) => {
    try {
        const parks = await prisma_1.default.park.findMany({
            include: {
                _count: {
                    select: { equipment: true }
                },
                minStocks: true
            }
        });
        res.json(parks);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching parks' });
    }
};
exports.getParks = getParks;
const createPark = async (req, res) => {
    const { name } = req.body;
    try {
        const park = await prisma_1.default.park.create({
            data: { name },
        });
        res.status(201).json(park);
    }
    catch (error) {
        res.status(400).json({ error: 'Error creating park' });
    }
};
exports.createPark = createPark;
const updateParkMinimums = async (req, res) => {
    const parkId = req.params.parkId;
    const { typeId, minQuantity } = req.body;
    if (req.user?.role !== 'LOGISTICA' && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only Logistics can update minimums' });
    }
    try {
        const minStock = await prisma_1.default.parkEquipmentMin.upsert({
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
    }
    catch (error) {
        res.status(400).json({ error: 'Error updating minimums' });
    }
};
exports.updateParkMinimums = updateParkMinimums;
const deletePark = async (req, res) => {
    const id = req.params.id;
    try {
        // Delete related min stocks first to avoid FK constraint issues
        await prisma_1.default.parkEquipmentMin.deleteMany({
            where: { parkId: id }
        });
        await prisma_1.default.park.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting park:', error);
        res.status(400).json({ error: 'No se puede eliminar el parque. Asegúrate de que no tenga equipos asociados.' });
    }
};
exports.deletePark = deletePark;
