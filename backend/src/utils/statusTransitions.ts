export type RequestStatus =
    | 'SOLICITUD_CREADA'
    | 'RECOGIDO_POR_LOGISTICA'
    | 'ENTREGADO_A_EMPRESA'
    | 'RETIRADO_POR_EMPRESA'
    | 'EN_TALLER'
    | 'MANTENIMIENTO_FINALIZADO'
    | 'ENTREGADO';

export const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
    'SOLICITUD_CREADA': ['RECOGIDO_POR_LOGISTICA', 'RETIRADO_POR_EMPRESA'],
    'RECOGIDO_POR_LOGISTICA': ['ENTREGADO_A_EMPRESA'],
    'ENTREGADO_A_EMPRESA': ['EN_TALLER'],
    'RETIRADO_POR_EMPRESA': ['EN_TALLER'],
    'EN_TALLER': ['MANTENIMIENTO_FINALIZADO'],
    'MANTENIMIENTO_FINALIZADO': ['ENTREGADO'],
    'ENTREGADO': []
};

export const isValidTransition = (from: string, to: string): boolean => {
    return ALLOWED_TRANSITIONS[from as RequestStatus]?.includes(to as RequestStatus) || false;
};
