export type Role = 'SOLICITANTE' | 'LOGISTICA' | 'EMPRESA_EXTERNA' | 'ADMIN' | 'COORDINADOR_INTERVENCION';

export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    vendorId?: string;
    createdAt?: string;
    vendor?: {
        name: string;
    };
}

export interface EquipmentType {
    id: string;
    name: string;
}

export interface Park {
    id: string;
    name: string;
    _count?: {
        equipment: number;
    };
    minStocks?: any[];
}

export interface ParkEquipmentMin {
    id: string;
    parkId: string;
    typeId: string;
    minQuantity: number;
    typeName?: string;
}

export interface Equipment {
    id: string;
    visualId: string;
    typeId: string;
    type: EquipmentType;
    status: string;
    parkId?: string;
    ownerId?: string;
    owner?: User;
}

export interface CoordinatorStats {
    globalStats: {
        typeName: string;
        typeId: string;
        count: number;
    }[];
    parkStats: {
        parkId: string;
        parkName: string;
        counts: Record<string, number>;
        alerts: {
            typeId: string;
            typeName: string;
            min: number;
            current: number;
            isBelowMin: boolean;
        }[];
    }[];
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}
