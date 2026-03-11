import apiClient from './apiClient';

export interface ServiceType {
    id: string;
    name: string;
    description?: string;
}

export const getServiceTypes = async (): Promise<ServiceType[]> => {
    const response = await apiClient.get('/service-types');
    return response.data;
};

export const createServiceType = async (data: Partial<ServiceType>) => {
    const response = await apiClient.post('/service-types', data);
    return response.data;
};

export const updateServiceType = async (id: string, data: Partial<ServiceType>) => {
    const response = await apiClient.put(`/service-types/${id}`, data);
    return response.data;
};

export const deleteServiceType = async (id: string) => {
    const response = await apiClient.delete(`/service-types/${id}`);
    return response.data;
};
