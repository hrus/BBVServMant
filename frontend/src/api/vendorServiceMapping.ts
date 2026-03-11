import apiClient from './apiClient';
import type { ServiceType } from './serviceTypeService';

export interface VendorServiceMapping {
    id: string;
    vendorId: string;
    equipmentTypeId: string;
    serviceTypeId: string;
    serviceType?: ServiceType;
}

export const getServiceMappings = async (): Promise<VendorServiceMapping[]> => {
    const response = await apiClient.get('/service-mappings');
    return response.data;
};

export const setServicesForVendorType = async (vendorId: string, equipmentTypeId: string, serviceTypeIds: string[]) => {
    const response = await apiClient.post('/service-mappings/set-services', {
        vendorId,
        equipmentTypeId,
        serviceTypeIds
    });
    return response.data;
};
