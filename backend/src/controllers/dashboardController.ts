import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const getCoordinatorDashboard = async (req: AuthRequest, res: Response) => {
    try {
        // Global Operational Data (EN_PARQUE)
        const globalOperational = await prisma.equipment.groupBy({
            by: ['typeId'],
            where: {
                status: 'EN_PARQUE'
            },
            _count: {
                _all: true
            },
        });

        // Enrich global counts with Type names
        const equipmentTypes = await prisma.equipmentType.findMany();
        const globalStats = globalOperational.map(stat => ({
            typeName: equipmentTypes.find(t => t.id === stat.typeId)?.name || 'Unknown',
            typeId: stat.typeId,
            count: stat._count._all
        }));

        // Per Park Operational Data + Alarms
        const parks = await prisma.park.findMany({
            include: {
                equipment: {
                    where: { status: 'EN_PARQUE' },
                    select: { typeId: true }
                },
                minStocks: true
            }
        });

        const parkStats = parks.map((park: any) => {
            const countsByType: Record<string, number> = {};
            park.equipment.forEach((eq: { typeId: string }) => {
                countsByType[eq.typeId] = (countsByType[eq.typeId] || 0) + 1;
            });

            const alerts = park.minStocks.map((min: { typeId: string, minQuantity: number }) => {
                const currentCount = countsByType[min.typeId] || 0;
                return {
                    typeId: min.typeId,
                    typeName: equipmentTypes.find(t => t.id === min.typeId)?.name || 'Unknown',
                    min: min.minQuantity,
                    current: currentCount,
                    isBelowMin: currentCount < min.minQuantity
                };
            }).filter((a: { isBelowMin: boolean }) => a.isBelowMin);

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
    } catch (error) {
        res.status(500).json({ error: 'Error fetching coordinator dashboard data' });
    }
};
