import type { Position } from './index';

// ── Auth DTOs ──────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  user: UserResponse;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// ── User DTOs ──────────────────────────────────────────────
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UploadAvatarResponse {
  url: string;
}

// ── Master DTOs ────────────────────────────────────────────
export interface MasterResponse {
  id: string;
  name: string;
  phone?: string;
  avatar?: string;
  positions: Position[];
  clientsServed: number;
  revenue: number;
}

export interface CreateMasterRequest {
  name: string;
  phone?: string;
  positions: Position[];
}

export interface UpdateMasterRequest {
  name?: string;
  phone?: string;
  positions?: Position[];
}

export interface MasterListResponse {
  data: MasterResponse[];
  total: number;
}

// ── Client DTOs ────────────────────────────────────────────
export interface ClientResponse {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  avatar?: string;
  lastVisit?: string;
  category?: string;
}

export interface CreateClientRequest {
  name: string;
  phone: string;
  email?: string;
}

export interface UpdateClientRequest {
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface ClientListResponse {
  data: ClientResponse[];
  total: number;
}

// ── Service DTOs ───────────────────────────────────────────
export interface ServiceResponse {
  id: string;
  name: string;
  position: Position;
  duration?: number;
  description?: string;
}

export interface CreateServiceRequest {
  name: string;
  position: Position;
  duration?: number;
  description?: string;
}

export interface ServiceListResponse {
  data: ServiceResponse[];
  total: number;
}

// ── Procedure DTOs ─────────────────────────────────────────
export interface ProcedureResponse {
  id: string;
  clientId: string;
  masterId: string;
  date: string;
  services: string[];
  positions: Position[];
  notes?: string;
  photos?: string[];
  client?: ClientResponse;
  master?: MasterResponse;
}

export interface CreateProcedureRequest {
  clientId: string;
  masterId: string;
  services: string[];
  positions: Position[];
  notes?: string;
  photos?: string[];
}

export interface UpdateProcedureRequest {
  services?: string[];
  positions?: Position[];
  notes?: string;
  photos?: string[];
}

export interface ProcedureListResponse {
  data: ProcedureResponse[];
  total: number;
}

// ── Filter DTOs ────────────────────────────────────────────
export interface ProcedureFilters {
  masterId?: string;
  clientId?: string;
  position?: Position;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ClientFilters {
  tag?: string;
  search?: string;
}

export interface MasterFilters {
  position?: Position;
  search?: string;
}

// ── Paginated Request ──────────────────────────────────────
export interface PaginatedRequest {
  page?: number;
  limit?: number;
}
