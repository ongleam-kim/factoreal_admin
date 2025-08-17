# Factoreal Admin Dashboard - Backend PRD (MVP)

## Executive Summary

Factoreal Admin Dashboard Backend은 MVP 단계의 관리자 인터페이스를 위한 간소화된 API 시스템입니다. 기존 Supabase 데이터베이스의 사용자-문의 데이터를 읽기 전용으로 시각화하는 핵심 기능에 집중하여 최소한의 복잡성으로 빠른 가치 제공을 목표로 합니다.

## Product Overview

### Core Services (MVP)
1. **사용자-문의 데이터 API**: 읽기 전용 조회, 필터링, 페이지네이션
2. **데이터 시각화 지원**: 차트 및 대시보드를 위한 집계 데이터 제공
3. **관리자 인증**: Supabase Auth 기반 간단한 인증

### Technical Requirements (MVP)
- **성능**: <500ms API 응답 시간
- **확장성**: 동시 사용자 10명 (MVP 범위)
- **보안**: 읽기 전용 접근, 기본 인증

## Technical Architecture

### System Architecture (MVP)
```
┌─────────────────────────────────────────────────────────┐
│                   Client (Admin UI)                    │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS/REST API
┌─────────────────────▼───────────────────────────────────┐
│               Next.js API Routes                       │
│  - Supabase Auth                                        │
│  - Request Validation                                   │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│               Application Layer                         │
│ ┌─────────────┐ ┌─────────────┐                         │
│ │    Data     │ │ Analytics   │                         │
│ │  Service    │ │  Service    │                         │
│ └─────────────┘ └─────────────┘                         │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                Database Layer                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │          Supabase (PostgreSQL)                     │ │
│ │            - Read-only Access                      │ │
│ │            - Built-in Auth                         │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack (MVP)
- **런타임**: Node.js 20+ with TypeScript
- **프레임워크**: Next.js 15 API Routes
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **검증**: Zod
- **ORM**: Drizzle ORM
- **UI**: React + TailwindCSS

## Database Design (MVP - Read Only)

### Existing Tables (Supabase)
MVP에서는 기존 Supabase 데이터베이스의 테이블을 읽기 전용으로 활용합니다.

#### 1. users 테이블 (기존)
```sql
-- 기존 테이블 구조 (읽기 전용)
users (
    id: UUID,
    email: VARCHAR,
    name: VARCHAR,
    company_name: VARCHAR,
    phone: VARCHAR,
    registration_source: VARCHAR,
    is_verified: BOOLEAN,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
    last_login_at: TIMESTAMP
)
```

#### 2. inquiries 테이블 (기존)
```sql
-- 기존 테이블 구조 (읽기 전용)
inquiries (
    id: UUID,
    user_id: UUID,
    type: VARCHAR,
    title: VARCHAR,
    content: TEXT,
    status: VARCHAR,
    priority: VARCHAR,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
    resolved_at: TIMESTAMP
)
```

### Data Views for Analytics (MVP)
읽기 전용 데이터에서 효율적인 분석을 위한 뷰를 생성합니다.

#### 사용자-문의 조인 뷰 (MVP)
```sql
-- 읽기 전용 데이터를 위한 간소화된 뷰
CREATE VIEW user_inquiry_summary AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email as user_email,
    u.company_name,
    u.created_at as user_registered_at,
    u.last_login_at,
    
    i.id as inquiry_id,
    i.type as inquiry_type,
    i.title as inquiry_title,
    i.status as inquiry_status,
    i.priority,
    i.created_at as inquiry_created_at,
    i.updated_at as inquiry_updated_at,
    
    -- 기본 통계 정보
    stats.total_inquiries,
    stats.resolved_inquiries
    
FROM users u
LEFT JOIN inquiries i ON u.id = i.user_id
LEFT JOIN LATERAL (
    SELECT 
        COUNT(*) as total_inquiries,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_inquiries
    FROM inquiries
    WHERE user_id = u.id
) stats ON true;
```

## API Specifications (MVP)

### Authentication Endpoints

#### POST /api/auth/signin
```typescript
// Supabase Auth 기반 로그인
interface SigninRequest {
  email: string;
  password: string;
}

interface SigninResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    role: string;
  };
  session: any; // Supabase session
}

// Response: 200 OK | 401 Unauthorized | 422 Validation Error
```

#### POST /api/auth/signout
```typescript
interface SignoutResponse {
  success: boolean;
  message: string;
}

// Response: 200 OK
```

### Data Visualization APIs (MVP)

#### GET /api/data/users-inquiries
```typescript
interface GetUsersInquiriesRequest {
  page?: number; // default: 1
  limit?: number; // default: 20, max: 100
  sortBy?: 'user_name' | 'company_name' | 'inquiry_created_at';
  sortOrder?: 'asc' | 'desc';
  
  // Filters
  inquiryType?: string[];
  inquiryStatus?: string[];
  dateFrom?: string; // ISO date
  dateTo?: string; // ISO date
  search?: string; // name, email, company search
}

interface GetUsersInquiriesResponse {
  success: boolean;
  data: UserInquiryJoin[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Response: 200 OK | 400 Bad Request | 401 Unauthorized
```

#### GET /api/data/users/:userId
```typescript
interface GetUserDetailResponse {
  success: boolean;
  data: {
    user: User;
    inquiries: Inquiry[];
    stats: {
      totalInquiries: number;
      resolvedInquiries: number;
      pendingInquiries: number;
    };
  };
}

// Response: 200 OK | 404 Not Found | 401 Unauthorized
```

#### GET /api/data/inquiries/:inquiryId
```typescript
interface GetInquiryDetailResponse {
  success: boolean;
  data: {
    inquiry: Inquiry;
    user: User;
  };
}

// Response: 200 OK | 404 Not Found | 401 Unauthorized
```

### Analytics APIs (MVP)

#### GET /api/analytics/dashboard
```typescript
interface GetDashboardAnalyticsResponse {
  success: boolean;
  data: {
    users: {
      total: number;
      newThisMonth: number;
      activeThisMonth: number;
    };
    inquiries: {
      total: number;
      pending: number;
      resolved: number;
      byType: { type: string; count: number }[];
      byStatus: { status: string; count: number }[];
    };
    trends: {
      inquiriesByDay: { date: string; count: number }[];
      usersByDay: { date: string; count: number }[];
    };
  };
}

// Response: 200 OK | 401 Unauthorized
```

#### GET /api/analytics/inquiries
```typescript
interface GetInquiryAnalyticsRequest {
  dateFrom?: string;
  dateTo?: string;
  groupBy?: 'day' | 'week' | 'month';
}

interface GetInquiryAnalyticsResponse {
  success: boolean;
  data: {
    totalCount: number;
    byType: { type: string; count: number }[];
    byStatus: { status: string; count: number }[];
    timeSeriesData: { date: string; count: number }[];
  };
}

// Response: 200 OK | 401 Unauthorized
```

## Service Layer Architecture (MVP)

### Data Service
```typescript
class DataService {
  // 읽기 전용 데이터 조회
  async getUsersWithInquiries(filters: UserInquiryFilters): Promise<PaginatedResult<UserInquiryJoin>>;
  async getUserById(userId: string): Promise<UserWithDetails>;
  async getInquiryById(inquiryId: string): Promise<InquiryWithUser>;
  
  // 검색 및 필터링
  async searchUsers(query: string): Promise<User[]>;
  async searchInquiries(query: string): Promise<Inquiry[]>;
}
```

### Analytics Service
```typescript
class AnalyticsService {
  // 대시보드 데이터
  async getDashboardStats(): Promise<DashboardStats>;
  async getInquiryAnalytics(filters: AnalyticsFilters): Promise<InquiryAnalytics>;
  async getUserAnalytics(filters: AnalyticsFilters): Promise<UserAnalytics>;
  
  // 시계열 데이터
  async getInquiryTrends(dateRange: DateRange, groupBy: 'day' | 'week' | 'month'): Promise<TrendData[]>;
  async getUserRegistrationTrends(dateRange: DateRange): Promise<TrendData[]>;
}
```

## Security & Authentication (MVP)

### Supabase Authentication
```typescript
// Supabase에서 제공하는 인증 활용
interface AuthConfig {
  providers: ['email'];
  jwt: {
    issuer: 'supabase';
    audience: 'authenticated';
  };
  rls: true; // Row Level Security 활용
}
```

### Row Level Security (RLS) Policies
```sql
-- 관리자만 데이터 조회 가능
CREATE POLICY "Admin only access" ON users
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admin only access" ON inquiries
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

### Input Validation (MVP)
```typescript
// Zod Schemas for data queries
const getUsersInquiriesSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['user_name', 'company_name', 'inquiry_created_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  inquiryType: z.array(z.string()).optional(),
  inquiryStatus: z.array(z.string()).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

const analyticsFilterSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
});
```

## Performance & Scalability (MVP)

### Database Optimization
- **Supabase Connection**: 기본 connection pool 활용
- **Query Optimization**: 인덱스 기반 효율적 쿼리
- **Read-only Access**: 데이터 수정 없는 읽기 전용 접근

### Caching Strategy (Simple)
```typescript
// Next.js 내장 캐싱 활용
interface CacheConfig {
  userInquiries: {
    revalidate: 300, // 5 minutes
  };
  analytics: {
    revalidate: 600, // 10 minutes
  };
}
```

## Error Handling (MVP)

### Error Types
```typescript
enum ErrorCode {
  // Authentication
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Resource
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  
  // System
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

interface APIError {
  code: ErrorCode;
  message: string;
  details?: any;
  requestId: string;
  timestamp: string;
}
```

## Testing Strategy (MVP)

### Unit Testing
```typescript
// Service Layer Tests
describe('DataService', () => {
  describe('getUsersWithInquiries', () => {
    it('should fetch users with inquiries using pagination');
    it('should apply filters correctly');
    it('should handle database connection errors');
  });
});

describe('AnalyticsService', () => {
  describe('getDashboardStats', () => {
    it('should return dashboard statistics');
    it('should handle empty data gracefully');
  });
});
```

### Integration Testing
```typescript
// API Integration Tests
describe('GET /api/data/users-inquiries', () => {
  it('should return paginated users with inquiries');
  it('should apply search filters');
  it('should require authentication');
  it('should handle invalid parameters');
});

describe('GET /api/analytics/dashboard', () => {
  it('should return dashboard analytics');
  it('should require admin authentication');
});
```

## Deployment & Infrastructure (MVP)

### Environment Configuration
```typescript
interface EnvironmentConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // Next.js
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  
  // Application
  NODE_ENV: 'development' | 'production';
  PORT: number;
}
```

### Deployment (Vercel)
```typescript
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

---

**문서 버전**: 1.0 (MVP)  
**작성일**: 2025-01-17  
**다음 리뷰**: 2025-02-17  
**의존성**: Frontend Admin PRD v1.0