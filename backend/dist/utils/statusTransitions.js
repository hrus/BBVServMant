"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidTransition = exports.ALLOWED_TRANSITIONS = void 0;
exports.ALLOWED_TRANSITIONS = {
    'SOLICITUD_CREADA': ['RECOGIDO_POR_LOGISTICA', 'RETIRADO_POR_EMPRESA'],
    'RECOGIDO_POR_LOGISTICA': ['ENTREGADO_A_EMPRESA'],
    'ENTREGADO_A_EMPRESA': ['EN_TALLER'],
    'RETIRADO_POR_EMPRESA': ['EN_TALLER'],
    'EN_TALLER': ['MANTENIMIENTO_FINALIZADO'],
    'MANTENIMIENTO_FINALIZADO': ['ENTREGADO'],
    'ENTREGADO': []
};
const isValidTransition = (from, to) => {
    return exports.ALLOWED_TRANSITIONS[from]?.includes(to) || false;
};
exports.isValidTransition = isValidTransition;
