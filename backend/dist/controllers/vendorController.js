"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVendor = exports.createVendor = exports.getVendors = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getVendors = async (req, res) => {
    try {
        const vendors = await prisma_1.default.vendor.findMany();
        res.json(vendors);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching vendors' });
    }
};
exports.getVendors = getVendors;
const createVendor = async (req, res) => {
    const { name, services, contactInfo } = req.body;
    try {
        const vendor = await prisma_1.default.vendor.create({
            data: { name, services, contactInfo }
        });
        res.status(201).json(vendor);
    }
    catch (error) {
        res.status(400).json({ error: 'Error creating vendor' });
    }
};
exports.createVendor = createVendor;
const updateVendor = async (req, res) => {
    const id = req.params.id;
    const { name, services, contactInfo } = req.body;
    try {
        const vendor = await prisma_1.default.vendor.update({
            where: { id },
            data: { name, services, contactInfo }
        });
        res.json(vendor);
    }
    catch (error) {
        res.status(400).json({ error: 'Error updating vendor' });
    }
};
exports.updateVendor = updateVendor;
