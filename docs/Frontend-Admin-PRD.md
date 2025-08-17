# Factoreal Admin Dashboard - Frontend PRD

## Executive Summary

Factoreal Admin Dashboard는 고객 문의 데이터를 효율적으로 관리하고 이메일 템플릿을 통한 고객 응답 자동화를 위한 관리자 전용 웹 인터페이스입니다. 두 가지 핵심 기능을 제공합니다: 1) 사용자-문의 통합 데이터 관리 대시보드, 2) 이메일 템플릿 관리 및 발송 시스템.

## Product Overview

### Target Users

- Factoreal 내부 관리자
- 고객 지원팀
- 영업팀

### Core Features

1. **사용자-문의 통합 관리 페이지**: 사용자 정보와 문의 데이터를 조인하여 통합 뷰 제공
2. **이메일 템플릿 관리 페이지**: 문의별 맞춤 이메일 템플릿 작성 및 발송

## User Stories & Requirements

### Epic 1: 사용자-문의 데이터 관리

**US-001: 통합 데이터 조회**

```
As an admin,
I want to view users and their inquiry data in a single table,
So that I can efficiently manage customer relationships and understand inquiry patterns.
```

**Acceptance Criteria:**

- 사용자 정보(이름, 이메일, 회사명, 등록일)와 문의 정보(문의 유형, 내용, 상태, 등록일)가 하나의 테이블에 표시
- 페이지네이션 지원 (20개 항목/페이지)
- 정렬 기능 (등록일, 이름, 회사명 기준)
- 필터링 기능 (문의 유형, 상태, 날짜 범위)
- 검색 기능 (이름, 이메일, 회사명으로 검색)

**US-002: 상세 정보 조회**

```
As an admin,
I want to view detailed information about a specific user and their inquiries,
So that I can provide personalized customer support.
```

**Acceptance Criteria:**

- 테이블 행 클릭 시 상세 정보 모달 표시
- 사용자의 모든 문의 내역 표시
- 문의별 응답 상태 및 이력 표시
- 고객 정보 편집 기능 (연락처, 회사 정보)

**US-003: 데이터 내보내기**

```
As an admin,
I want to export user and inquiry data,
So that I can analyze trends and create reports.
```

**Acceptance Criteria:**

- CSV/Excel 형식으로 데이터 내보내기
- 현재 필터 조건 적용된 데이터만 내보내기
- 내보내기 진행 상태 표시

### Epic 2: 이메일 템플릿 관리

**US-004: 템플릿 관리**

```
As an admin,
I want to create and manage email templates,
So that I can send consistent and professional responses to customer inquiries.
```

**Acceptance Criteria:**

- 템플릿 생성, 수정, 삭제 기능
- 리치 텍스트 에디터 (HTML 지원)
- 템플릿 변수 지원 ({userName}, {companyName}, {inquiryType} 등)
- 템플릿 미리보기 기능
- 템플릿 카테고리 분류 (문의 유형별)

**US-005: 이메일 발송**

```
As an admin,
I want to send templated emails to users,
So that I can efficiently respond to inquiries with personalized content.
```

**Acceptance Criteria:**

- 문의별 적절한 템플릿 선택
- 수신자 선택 (단일/다중 선택)
- 이메일 미리보기 및 편집
- 즉시 발송/예약 발송 기능
- 발송 상태 실시간 확인

**US-006: 이메일 이력 관리**

```
As an admin,
I want to track email sending history,
So that I can monitor communication with customers and avoid duplicate messages.
```

**Acceptance Criteria:**

- 발송된 이메일 목록 조회
- 발송 상태 (성공/실패/대기) 표시
- 수신자별 이메일 이력 조회
- 이메일 재발송 기능

## UI/UX Specifications

### Design System

- **컴포넌트 라이브러리**: shadcn/ui + Radix UI
- **스타일링**: Tailwind CSS
- **테마**: 다크 테마 기본, 라이트 테마 지원
- **언어**: 한국어

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header (관리자명, 로그아웃, 테마 토글)                    │
├─────────────────────────────────────────────────────────┤
│ Sidebar │ Main Content Area                             │
│         │                                               │
│ 📊 대시보드│ ┌─────────────────────────────────────────┐ │
│ 👥 사용자  │ │                                         │ │
│ 📧 이메일  │ │        Page Content                     │ │
│ ⚙️ 설정   │ │                                         │ │
│         │ │                                         │ │
│         │ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Page Specifications

#### 1. 사용자-문의 관리 페이지 (`/admin/users-inquiries`)

**페이지 구성:**

- 페이지 헤더: 제목, 새로고침, 내보내기 버튼
- 필터 섹션: 문의 유형, 상태, 날짜 범위 선택
- 검색 바: 이름/이메일/회사명 통합 검색
- 데이터 테이블: 정렬 가능한 컬럼, 페이지네이션
- 상세 정보 모달: 사용자 및 문의 상세 정보

**테이블 컬럼:**

1. 사용자명 (정렬 가능)
2. 이메일 (정렬 가능)
3. 회사명 (정렬 가능)
4. 최근 문의 유형
5. 문의 상태 (뱃지 표시)
6. 등록일 (정렬 가능)
7. 액션 (상세보기, 이메일 발송)

**상호작용:**

- 행 클릭: 상세 정보 모달 열기
- 컬럼 헤더 클릭: 정렬 방향 변경
- 액션 버튼: 이메일 발송 페이지로 이동

#### 2. 이메일 템플릿 관리 페이지 (`/admin/email-templates`)

**페이지 구성:**

- 템플릿 목록 (카드 레이아웃)
- 템플릿 에디터 (모달/사이드패널)
- 미리보기 기능
- 템플릿 분류 필터

**템플릿 에디터 기능:**

- 리치 텍스트 에디터 (TinyMCE/Quill)
- 변수 삽입 버튼 ({userName}, {companyName} 등)
- 실시간 미리보기
- 저장/취소/삭제 액션

#### 3. 이메일 발송 페이지 (`/admin/send-email`)

**페이지 구성:**

- 수신자 선택 (검색 가능한 드롭다운)
- 템플릿 선택
- 이메일 에디터 (템플릿 기반)
- 발송 옵션 (즉시/예약)
- 미리보기 및 테스트 발송

## Technical Architecture

### Tech Stack

- **프레임워크**: Next.js 15.3.1 (App Router)
- **UI 라이브러리**: React 19
- **타입스크립트**: 엄격 모드
- **스타일링**: Tailwind CSS
- **컴포넌트**: shadcn/ui + Radix UI
- **폼 관리**: React Hook Form + Zod
- **상태 관리**: Zustand
- **애니메이션**: Framer Motion

### Project Structure

```
src/
├── app/
│   └── admin/
│           ├── layout.tsx              // Admin layout with sidebar
│           ├── dashboard/
│           │   └── page.tsx           // Dashboard overview
│           ├── users-inquiries/
│           │   ├── page.tsx           // User-inquiry table
│           │   └── components/
│           │       ├── data-table.tsx
│           │       ├── filters.tsx
│           │       └── detail-modal.tsx
│           ├── email-templates/
│           │   ├── page.tsx           // Template management
│           │   └── components/
│           │       ├── template-editor.tsx
│           │       ├── template-card.tsx
│           │       └── template-preview.tsx
│           └── send-email/
│               ├── page.tsx           // Email sending interface
│               └── components/
│                   ├── recipient-selector.tsx
│                   ├── template-selector.tsx
│                   └── email-composer.tsx
├── components/
│   ├── admin/
│   │   ├── sidebar.tsx               // Admin navigation
│   │   ├── header.tsx                // Admin header
│   │   └── protected-route.tsx       // Admin auth wrapper
│   └── ui/                           // shadcn/ui components
├── hooks/
│   ├── use-admin-auth.ts            // Admin authentication
│   ├── use-users-inquiries.ts       // Data fetching
│   └── use-email-templates.ts       // Template management
├── lib/
│   ├── types/
│   │   ├── admin.ts                 // Admin-specific types
│   │   ├── user.ts                  // User data types
│   │   └── email.ts                 // Email template types
│   └── utils/
│       ├── admin-api.ts             // Admin API client
│       ├── email-validator.ts       // Email validation
│       └── export-utils.ts          // Data export utilities
```

## Component Specifications

### 1. AdminLayout (`/src/app/admin/layout.tsx`)

```typescript
interface AdminLayoutProps {
  children: React.ReactNode;
}

// Features:
// - Authentication check
// - Responsive sidebar navigation
// - Header with user info and logout
// - Protected route wrapper
```

### 2. DataTable (`/src/app/admin/users-inquiries/components/data-table.tsx`)

```typescript
interface DataTableProps {
  data: UserInquiryJoin[];
  pagination: PaginationState;
  sorting: SortingState;
  filtering: FilteringState;
  onRowClick: (row: UserInquiryJoin) => void;
  onExport: () => void;
}

// Features:
// - Server-side pagination
// - Multi-column sorting
// - Advanced filtering
// - Row selection
// - Export functionality
```

### 3. TemplateEditor (`/src/app/admin/email-templates/components/template-editor.tsx`)

```typescript
interface TemplateEditorProps {
  template?: EmailTemplate;
  onSave: (template: EmailTemplate) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

// Features:
// - Rich text editing
// - Variable insertion
// - Real-time preview
// - Auto-save functionality
// - Template validation
```

### 4. EmailComposer (`/src/app/admin/send-email/components/email-composer.tsx`)

```typescript
interface EmailComposerProps {
  selectedRecipients: User[];
  selectedTemplate?: EmailTemplate;
  onSend: (emailData: EmailSendRequest) => void;
  onSchedule: (emailData: EmailSendRequest, scheduleTime: Date) => void;
}

// Features:
// - Template-based composition
// - Variable replacement
// - Preview functionality
// - Send/schedule options
// - Attachment support
```

## Data Types

### Core Data Interfaces

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  phone?: string;
  registeredAt: Date;
  lastLoginAt?: Date;
}

interface Inquiry {
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

interface UserInquiryJoin {
  user: User;
  inquiry: Inquiry;
  latestResponse?: InquiryResponse;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string; // HTML content
  category: string;
  variables: string[]; // Available variables
  createdAt: Date;
  updatedAt: Date;
}

interface EmailSendRequest {
  recipientIds: string[];
  templateId: string;
  customContent?: string;
  scheduleTime?: Date;
  attachments?: File[];
}

type InquiryType = 'general' | 'technical' | 'pricing' | 'partnership';
type InquiryStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';
```

## Performance Requirements

### Loading Performance

- 초기 페이지 로드: < 2초
- 데이터 테이블 렌더링: < 1초
- 이메일 템플릿 미리보기: < 500ms
- 검색 결과 표시: < 300ms

### Data Handling

- 페이지네이션: 20개 항목/페이지
- 가상화된 스크롤 (1000+ 항목일 때)
- 무한 스크롤 옵션
- 클라이언트 사이드 캐싱

### Responsive Design

- 모바일: 768px 이하
- 태블릿: 768px - 1024px
- 데스크톱: 1024px 이상
- 사이드바 접기/펼치기 기능

## Security Considerations

### Authentication & Authorization

- JWT 기반 관리자 인증
- 역할 기반 접근 제어 (RBAC)
- 세션 타임아웃 (30분)
- 자동 로그아웃 기능

### Data Protection

- 민감한 데이터 마스킹
- 클라이언트 사이드 입력 검증
- XSS 방지를 위한 HTML 새니타이제이션
- CSRF 토큰 검증

### Audit Logging

- 관리자 액션 로깅
- 이메일 발송 기록
- 데이터 내보내기 기록
- 로그인/로그아웃 기록

## Localization Requirements

### Language Support

- **언어**: 한국어
- 날짜/시간 한국 표준 포맷
- 숫자 포맷 한국 표준

## Accessibility Requirements

### WCAG 2.1 AA 준수

- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 충분한 색상 대비 (4.5:1)
- 의미있는 alt 텍스트
- ARIA 라벨 및 역할

### Usability Features

- 로딩 상태 표시
- 에러 메시지 명확성
- 성공 피드백 제공
- 실행 취소 기능

## Testing Strategy

### Unit Testing

- 컴포넌트 렌더링 테스트
- 훅 로직 테스트
- 유틸리티 함수 테스트
- 폼 검증 테스트

### Integration Testing

- API 호출 테스트
- 페이지 네비게이션 테스트
- 데이터 플로우 테스트
- 인증 플로우 테스트

### Performance Testing

- 라이트하우스 점수 90+ 목표
- 대용량 데이터 처리 테스트
- 메모리 누수 검사
- 번들 크기 최적화

## Deployment & Monitoring

### Build & Deployment

- Next.js 프로덕션 빌드
- 정적 자산 최적화
- 코드 스플리팅
- 환경별 설정 관리

### Monitoring

- 에러 추적 (Sentry)
- 성능 모니터링
- 사용자 행동 분석
- 이메일 발송 상태 모니터링

## Future Enhancements

### Phase 2 Features

- 실시간 알림 시스템
- 대시보드 위젯 커스터마이징
- 고급 필터링 및 정렬
- 이메일 A/B 테스팅

### Phase 3 Features

- 모바일 앱 지원
- API 키 관리
- 워크플로우 자동화
- AI 기반 이메일 추천

---

**문서 버전**: 1.0  
**작성일**: 2025-01-17  
**다음 리뷰**: 2025-02-17
