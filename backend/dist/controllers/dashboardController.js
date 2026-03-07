"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoordinatorDashboard = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getCoordinatorDashboard = async (req, res) => {
    try {
        // Global Operational Data (EN_PARQUE)
        const globalOperational = await prisma_1.default.equipment.groupBy({
            by: ['typeId'],
            where: {
                status: 'EN_PARQUE'
            },
            _count: {
                _all: true
            },
        });
        // Enrich global counts with Type names
        const equipmentTypes = await prisma_1.default.equipmentType.findMany();
        const globalStats = globalOperational.map(stat => ({
            typeName: equipmentTypes.find(t => t.id === stat.typeId)?.name || 'Unknown',
            typeId: stat.typeId,
            count: stat._count._all
        }));
        // Per Park Operational Data + Alarms
        const parks = await prisma_1.default.park.findMany({
            include: {
                equipment: {
                    where: { status: 'EN_PARQUE' },
                    select: { typeId: true }
                },
                minStocks: true
            }
        });
        const parkStats = parks.map((park) => {
            const countsByType = {};
            park.equipment.forEach((eq) => {
                countsByType[eq.typeId] = (countsByType[eq.typeId] || 0) + 1;
            });
            const alerts = park.minStocks.map((min) => {
                const currentCount = countsByType[min.typeId] || 0;
                return {
                    typeId: min.typeId,
                    typeName: equipmentTypes.find(t => t.id === min.typeId)?.name || 'Unknown',
                    min: min.minQuantity,
                    current: currentCount,
                    isBelowMin: currentCount < min.minQuantity
                };
            }).filter((a) => a.isBelowMin);
            return {
                parkId: park.id,
                parkName: park.name,
                counts: countsByType,
                alerts
            };
        });
        res.json({
            globalStats,
            parkStats
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching coordinator dashboard data' });
    }
};
exports.getCoordinatorDashboard = getCoordinatorDashboard;
