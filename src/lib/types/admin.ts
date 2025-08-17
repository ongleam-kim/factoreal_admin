// 어드민 관련 타입 정의 (MVP 버전)

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  lastLoginAt?: Date;
  createdAt: Date;
}

export type AdminRole = 'admin' | 'manager'; // MVP에서는 단순한 역할만

export interface AuthState {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AdminUser;
  token: string;
  expiresAt: Date;
}

// 네비게이션 관련
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}