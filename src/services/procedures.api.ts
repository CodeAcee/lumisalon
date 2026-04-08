import { api } from '../lib/api-client';
import type {
  ProcedureResponse,
  ProcedureListResponse,
  CreateProcedureRequest,
  UpdateProcedureRequest,
  ProcedureFilters,
  PaginatedRequest,
} from '../types/dto';

export const proceduresApi = {
  getAll: (params?: ProcedureFilters & PaginatedRequest) =>
    api.get<ProcedureListResponse>('/procedures', { params }),

  getById: (id: string) =>
    api.get<ProcedureResponse>(`/procedures/${id}`),

  getByClient: (clientId: string, params?: PaginatedRequest) =>
    api.get<ProcedureListResponse>(`/clients/${clientId}/procedures`, { params }),

  getByMaster: (masterId: string, params?: PaginatedRequest) =>
    api.get<ProcedureListResponse>(`/masters/${masterId}/procedures`, { params }),

  create: (data: CreateProcedureRequest) =>
    api.post<ProcedureResponse>('/procedures', data),

  update: (id: string, data: UpdateProcedureRequest) =>
    api.patch<ProcedureResponse>(`/procedures/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/procedures/${id}`),

  uploadPhotos: (id: string, formData: FormData) =>
    api.post<{ urls: string[] }>(`/procedures/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
