"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatusSchema = exports.createRequestSchema = void 0;
const zod_1 = require("zod");
exports.createRequestSchema = zod_1.z.object({
    equipmentId: zod_1.z.string().uuid(),
    serviceType: zod_1.z.enum(['LIMPIEZA', 'MANTENIMIENTO']),
    notes: zod_1.z.string().optional(),
    pickupLocation: zod_1.z.string().min(3, 'La ubicación es obligatoria'),
});
exports.updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'SOLICITUD_CREADA',
        'RECOGIDO_POR_LOGISTICA',
        'ENTREGADO_A_EMPRESA',
        'RETIRADO_POR_EMPRESA',
        'EN_TALLER',
        'MANTENIMIENTO_FINALIZADO',
        'ENTREGADO'
    ]),
});
