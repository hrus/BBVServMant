import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    const vendorId = req.user?.vendorId;

    try {
        let stats: any = {};

        if (role === 'ADMIN' || role === 'LOGISTICA' || role === 'COORDINADOR_INTERVENCION') {
            const [userCount, equipmentCount, requestCount, maintenanceCount, equipmentTypes, parks] = await Promise.all([
                prisma.user.count(),
                prisma.equipment.count(),
                prisma.serviceRequest.count(),
                prisma.equipment.count({ where: { status: 'EN_MANTENIMIENTO' } }),
                prisma.equipmentType.findMany(),
                prisma.park.findMany({
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
            const globalOperational = await prisma.equipment.groupBy({
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
            const parkStats = parks.map((park: any) => {
                const countsByType: Record<string, number> = {};
                park.equipment.forEach((eq: { typeId: string }) => {
                    countsByType[eq.typeId] = (countsByType[eq.typeId] || 0) + 1;
                });

                const alerts = park.minStocks.map((min: any) => {
                    const currentCount = countsByType[min.typeId] || 0;
                    return {
                        typeId: min.typeId,
                        typeName: equipmentTypes.find(t => t.id === min.typeId)?.name || 'Unknown',
                        min: min.minQuantity,
                        current: currentCount,
                        isBelowMin: currentCount < min.minQuantity
                    };
                }).filter((a: any) => a.isBelowMin);

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
        } else if (role === 'EMPRESA_EXTERNA') {
            const [vendorRequests, vendorEquipment] = await Promise.all([
                prisma.serviceRequest.count({
                    where: { equipment: { type: { vendorId: vendorId || '' } } }
                }),
                prisma.equipment.count({
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
        } else {
            // SOLICITANTE / COORDINADOR
            const [myEquipment, myRequests] = await Promise.all([
                prisma.equipment.count({ where: { ownerId: userId } }),
                prisma.serviceRequest.findMany({
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
    } catch (error: any) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas de dashboard', details: error.message });
    }
};
