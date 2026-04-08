import { api } from '../lib/api-client';
import type {
  ServiceResponse,
  ServiceListResponse,
  CreateServiceRequest,
} from '../types/dto';

export const servicesApi = {
  getAll: () =>
    api.get<ServiceListResponse>('/services'),

  create: (data: CreateServiceRequest) =>
    api.post<ServiceResponse>('/services', data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/services/${id}`),
};
