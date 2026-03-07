"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEquipmentType = exports.createEquipmentType = exports.getEquipmentTypes = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getEquipmentTypes = async (req, res) => {
    try {
        const types = await prisma_1.default.equipmentType.findMany({
            include: { vendor: true }
        });
        res.json(types);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching equipment types' });
    }
};
exports.getEquipmentTypes = getEquipmentTypes;
const createEquipmentType = async (req, res) => {
    const { name, vendorId } = req.body;
    try {
        const type = await prisma_1.default.equipmentType.create({
            data: { name, vendorId }
        });
        res.status(201).json(type);
    }
    catch (error) {
        res.status(400).json({ error: 'Error creating equipment type' });
    }
};
exports.createEquipmentType = createEquipmentType;
const updateEquipmentType = async (req, res) => {
    const id = req.params.id;
    const { name, vendorId } = req.body;
    try {
        const type = await prisma_1.default.equipmentType.update({
            where: { id },
            data: { name, vendorId }
        });
        res.json(type);
    }
    catch (error) {
        res.status(400).json({ error: 'Error updating equipment type' });
    }
};
exports.updateEquipmentType = updateEquipmentType;
