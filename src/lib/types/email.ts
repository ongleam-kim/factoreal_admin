// 이메일 관련 타입 정의 (MVP 버전)

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string; // 기본 텍스트 (MVP에서는 HTML 제외)
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailSendRequest {
  recipientIds: string[];
  templateId: string;
  customSubject?: string;
  customContent?: string;
}

export interface EmailSendHistory {
  id: string;
  recipientEmail: string;
  recipientName: string;
  templateId: string;
  templateName: string;
  subject: string;
  status: EmailStatus;
  sentAt: Date;
  errorMessage?: string;
}

export type EmailStatus = 'pending' | 'sent' | 'failed';

// 이메일 템플릿 카테고리
export const EMAIL_CATEGORIES = [
  'general',
  'technical',
  'pricing',
  'partnership',
  'welcome',
  'follow-up'
] as const;

export type EmailCategory = typeof EMAIL_CATEGORIES[number];