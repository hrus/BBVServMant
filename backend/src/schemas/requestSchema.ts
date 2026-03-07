import { z } from 'zod';

export const createRequestSchema = z.object({
    equipmentId: z.string().uuid(),
    serviceType: z.enum(['LIMPIEZA', 'MANTENIMIENTO']),
    notes: z.string().optional(),
    pickupLocation: z.string().min(3, 'La ubicación es obligatoria'),
});

export const updateStatusSchema = z.object({
    status: z.enum([
        'SOLICITUD_CREADA',
        'RECOGIDO_POR_LOGISTICA',
        'ENTREGADO_A_EMPRESA',
        'RETIRADO_POR_EMPRESA',
        'EN_TALLER',
        'MANTENIMIENTO_FINALIZADO',
        'ENTREGADO'
    ]),
});
