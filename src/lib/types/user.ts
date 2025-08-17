// 사용자 관련 타입 정의 (MVP 버전)

export interface User {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  phone?: string;
  registeredAt: Date;
  lastLoginAt?: Date;
}

export interface Inquiry {
  id: string;
  userId: string;
  type: InquiryType;
  title: string;
  content: string;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
  responseCount: number;
}

export interface UserInquiryJoin {
  user: User;
  inquiry: Inquiry;
}

export type InquiryType = 'general' | 'technical' | 'pricing' | 'partnership';
export type InquiryStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

// 테이블 관련 타입 (MVP - 기본 기능만)
export interface TableFilters {
  search?: string;
  status?: InquiryStatus;
  type?: InquiryType;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortingState {
  id: string;
  desc: boolean;
}