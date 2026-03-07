import { isValidTransition, RequestStatus } from '../src/utils/statusTransitions';

describe('State Transition Logic', () => {
    test('should allow valid transitions for Logistics', () => {
        expect(isValidTransition('SOLICITUD_CREADA', 'RECOGIDO_POR_LOGISTICA')).toBe(true);
        expect(isValidTransition('RECOGIDO_POR_LOGISTICA', 'ENTREGADO_A_EMPRESA')).toBe(true);
        expect(isValidTransition('MANTENIMIENTO_FINALIZADO', 'ENTREGADO')).toBe(true);
    });

    test('should allow valid transitions for External Company', () => {
        expect(isValidTransition('SOLICITUD_CREADA', 'RETIRADO_POR_EMPRESA')).toBe(true);
        expect(isValidTransition('RETIRADO_POR_EMPRESA', 'EN_TALLER')).toBe(true);
        expect(isValidTransition('ENTREGADO_A_EMPRESA', 'EN_TALLER')).toBe(true);
        expect(isValidTransition('EN_TALLER', 'MANTENIMIENTO_FINALIZADO')).toBe(true);
    });

    test('should reject invalid transitions', () => {
        expect(isValidTransition('SOLICITUD_CREADA', 'ENTREGADO')).toBe(false);
        expect(isValidTransition('EN_TALLER', 'SOLICITUD_CREADA')).toBe(false);
        expect(isValidTransition('ENTREGADO', 'EN_TALLER')).toBe(false);
    });

    test('should handle unknown statuses gracefully', () => {
        expect(isValidTransition('NON_EXISTENT', 'SOLICITUD_CREADA')).toBe(false);
        expect(isValidTransition('SOLICITUD_CREADA', 'NON_EXISTENT')).toBe(false);
    });
});
