import { api } from '../lib/api-client';
import type {
  ClientResponse,
  ClientListResponse,
  CreateClientRequest,
  UpdateClientRequest,
  ClientFilters,
  PaginatedRequest,
} from '../types/dto';

export const clientsApi = {
  getAll: (params?: ClientFilters & PaginatedRequest) =>
    api.get<ClientListResponse>('/clients', { params }),

  getById: (id: string) =>
    api.get<ClientResponse>(`/clients/${id}`),

  create: (data: CreateClientRequest) =>
    api.post<ClientResponse>('/clients', data),

  update: (id: string, data: UpdateClientRequest) =>
    api.patch<ClientResponse>(`/clients/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/clients/${id}`),
};
