import { api } from '../lib/api-client';
import type {
  MasterResponse,
  MasterListResponse,
  CreateMasterRequest,
  UpdateMasterRequest,
  MasterFilters,
  PaginatedRequest,
} from '../types/dto';

export const mastersApi = {
  getAll: (params?: MasterFilters & PaginatedRequest) =>
    api.get<MasterListResponse>('/masters', { params }),

  getById: (id: string) =>
    api.get<MasterResponse>(`/masters/${id}`),

  create: (data: CreateMasterRequest) =>
    api.post<MasterResponse>('/masters', data),

  update: (id: string, data: UpdateMasterRequest) =>
    api.patch<MasterResponse>(`/masters/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/masters/${id}`),
};
