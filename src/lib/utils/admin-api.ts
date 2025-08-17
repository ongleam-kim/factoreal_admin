// Admin API Client (MVP 버전)

import type {
  UserInquiryJoin,
  EmailTemplate,
  EmailSendRequest,
  EmailSendHistory,
  AdminUser,
  LoginRequest,
  LoginResponse,
  ApiResponse,
  PaginatedResponse,
  TableFilters,
  PaginationState,
  SortingState,
} from '@/lib/types';

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class AdminApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    // 로컬 스토리지에서 토큰 복원 (브라우저에서만)
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
  }

  // 공통 fetch 메서드
  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'API 오류가 발생했습니다.',
          errors: data.errors,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API 호출 오류:', error);
      return {
        success: false,
        message: '네트워크 오류가 발생했습니다.',
      };
    }
  }

  // 토큰 설정
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  // 토큰 제거
  removeToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  }

  // 인증 관련 API
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.fetch<LoginResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    const result = await this.fetch<void>('/auth/signout', {
      method: 'POST',
    });
    this.removeToken();
    return result;
  }

  async getCurrentUser(): Promise<ApiResponse<AdminUser>> {
    return this.fetch<AdminUser>('/auth/me');
  }

  // 사용자 & 문의 관리 API
  async getUsersInquiries(
    filters: TableFilters = {},
    pagination: PaginationState = { pageIndex: 0, pageSize: 20 },
    sorting: SortingState = { id: 'createdAt', desc: true }
  ): Promise<ApiResponse<PaginatedResponse<UserInquiryJoin>>> {
    const params = new URLSearchParams({
      page: (pagination.pageIndex + 1).toString(),
      pageSize: pagination.pageSize.toString(),
      sortBy: sorting.id,
      sortOrder: sorting.desc ? 'desc' : 'asc',
      ...Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value != null && value !== '')
      ),
    });

    return this.fetch<PaginatedResponse<UserInquiryJoin>>(`/data/users-inquiries?${params}`);
  }

  async getUserInquiry(id: string): Promise<ApiResponse<UserInquiryJoin>> {
    return this.fetch<UserInquiryJoin>(`/data/users-inquiries/${id}`);
  }

  // 이메일 템플릿 관리 API
  async getEmailTemplates(): Promise<ApiResponse<EmailTemplate[]>> {
    return this.fetch<EmailTemplate[]>('/admin/email-templates');
  }

  async getEmailTemplate(id: string): Promise<ApiResponse<EmailTemplate>> {
    return this.fetch<EmailTemplate>(`/admin/email-templates/${id}`);
  }

  async createEmailTemplate(
    template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<EmailTemplate>> {
    return this.fetch<EmailTemplate>('/admin/email-templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async updateEmailTemplate(
    id: string,
    template: Partial<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ApiResponse<EmailTemplate>> {
    return this.fetch<EmailTemplate>(`/admin/email-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
  }

  async deleteEmailTemplate(id: string): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/admin/email-templates/${id}`, {
      method: 'DELETE',
    });
  }

  // 이메일 발송 API
  async sendEmail(request: EmailSendRequest): Promise<ApiResponse<EmailSendHistory[]>> {
    return this.fetch<EmailSendHistory[]>('/admin/emails/send', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getEmailHistory(
    pagination: PaginationState = { pageIndex: 0, pageSize: 20 }
  ): Promise<ApiResponse<PaginatedResponse<EmailSendHistory>>> {
    const params = new URLSearchParams({
      page: (pagination.pageIndex + 1).toString(),
      pageSize: pagination.pageSize.toString(),
    });

    return this.fetch<PaginatedResponse<EmailSendHistory>>(`/admin/emails/history?${params}`);
  }

  // 대시보드 통계 API
  async getDashboardStats(): Promise<
    ApiResponse<{
      totalUsers: number;
      totalInquiries: number;
      emailTemplates: number;
      emailsSent: number;
    }>
  > {
    return this.fetch('/analytics/dashboard');
  }
}

// 싱글톤 인스턴스 생성
export const adminApi = new AdminApiClient();

// 기본 export
export default adminApi;
