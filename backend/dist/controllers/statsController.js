"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getDashboardStats = async (req, res) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    const vendorId = req.user?.vendorId;
    try {
        let stats = {};
        if (role === 'ADMIN' || role === 'LOGISTICA' || role === 'COORDINADOR_INTERVENCION') {
            const [userCount, equipmentCount, requestCount, maintenanceCount, equipmentTypes, parks] = await Promise.all([
                prisma_1.default.user.count(),
                prisma_1.default.equipment.count(),
                prisma_1.default.serviceRequest.count(),
                prisma_1.default.equipment.count({ where: { status: 'EN_MANTENIMIENTO' } }),
                prisma_1.default.equipmentType.findMany(),
                prisma_1.default.park.findMany({
                    include: {
                        equipment: {
                            where: { status: 'EN_PARQUE' },
                            select: { typeId: true }
                        },
                        minStocks: true
                    }
                })
            ]);
            // Operational stats (Ready in Park)
            const globalOperational = await prisma_1.default.equipment.groupBy({
                by: ['typeId'],
                where: { status: 'EN_PARQUE' },
                _count: { _all: true },
            });
            const globalStats = equipmentTypes.map(type => {
                const count = globalOperational.find(stat => stat.typeId === type.id)?._count._all || 0;
                return {
                    typeName: type.name,
                    typeId: type.id,
                    count
                };
            });
            // Per Park Alerts
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
            stats = {
                users: userCount,
                totalEquipment: equipmentCount,
                totalRequests: requestCount,
                inMaintenance: maintenanceCount,
                globalStats,
                parkStats,
                totalAlerts: parkStats.reduce((acc, p) => acc + p.alerts.length, 0)
            };
        }
        else if (role === 'EMPRESA_EXTERNA') {
            const [vendorRequests, vendorEquipment] = await Promise.all([
                prisma_1.default.serviceRequest.count({
                    where: { equipment: { type: { vendorId: vendorId || '' } } }
                }),
                prisma_1.default.equipment.count({
                    where: {
                        type: { vendorId: vendorId || '' },
                        status: 'EN_MANTENIMIENTO'
                    }
                })
            ]);
            stats = {
                assignedRequests: vendorRequests,
                equipmentInWorkshop: vendorEquipment
            };
        }
        else {
            // SOLICITANTE / COORDINADOR
            const [myEquipment, myRequests] = await Promise.all([
                prisma_1.default.equipment.count({ where: { ownerId: userId } }),
                prisma_1.default.serviceRequest.findMany({
                    where: { requesterId: userId },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                })
            ]);
            stats = {
                myEquipmentCount: myEquipment,
                recentRequests: myRequests
            };
        }
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas de dashboard', details: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
