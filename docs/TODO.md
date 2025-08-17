# Factoreal Admin Dashboard - 추가 작업 사항

## 완료된 작업

### ✅ Backend API 구현 (MVP 완료)
- [x] Supabase + Drizzle ORM 설정
- [x] 환경 변수 구성 (.env.local.example)
- [x] 데이터베이스 스키마 정의 (users, inquiries 테이블)
- [x] 인증 API (/api/auth/signin, /api/auth/signout)
- [x] 데이터 조회 API (/api/data/users-inquiries, /api/data/users/[userId], /api/data/inquiries/[inquiryId])
- [x] 분석 API (/api/analytics/dashboard, /api/analytics/inquiries)
- [x] 프론트엔드 API 연동 (엔드포인트 수정)
- [x] package.json 스크립트 추가 (Drizzle 관련)

## 필수 추가 작업

### 🔧 1. 환경 설정 및 데이터베이스 준비

#### Supabase 프로젝트 설정
```bash
# 1. Supabase 프로젝트 생성 (supabase.com)
# 2. 환경 변수 설정
cp .env.local.example .env.local

# 3. .env.local 파일 수정 필요
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[dbname]
NEXTAUTH_SECRET=your_random_secret_key
```

#### 데이터베이스 마이그레이션
```bash
# Drizzle 마이그레이션 생성 및 실행
npm run db:generate
npm run db:migrate
# 또는 개발 중에는
npm run db:push
```

### 🛡️ 2. 관리자 인증 시스템 강화

#### Supabase Auth 관리자 권한 설정
- [ ] Supabase Auth에서 관리자 계정 생성
- [ ] user_metadata에 role: 'admin' 설정
- [ ] Row Level Security (RLS) 정책 적용:
```sql
-- users 테이블 RLS 정책
CREATE POLICY "Admin only access" ON users
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- inquiries 테이블 RLS 정책  
CREATE POLICY "Admin only access" ON inquiries
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

#### 인증 흐름 개선
- [ ] `/api/auth/me` 엔드포인트 구현 (현재 사용자 정보 조회)
- [ ] 프론트엔드 인증 상태 관리 개선
- [ ] 토큰 갱신 로직 구현

### 📊 3. 데이터 구조 및 API 응답 형식 통일

#### 프론트엔드-백엔드 데이터 타입 매칭
- [ ] `src/lib/types/` 의 타입 정의를 백엔드 스키마와 일치시키기
- [ ] API 응답 형식 표준화 (ApiResponse<T> 타입 적용)
- [ ] 페이지네이션 응답 형식 통일

#### 예시 수정 필요 사항:
```typescript
// 현재 프론트엔드가 기대하는 형식과 백엔드 응답 매칭 필요
interface DashboardStats {
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
}
```

### 📝 4. 이메일 관련 기능 구현 (Backend PRD 범위 외)

현재 프론트엔드에서 기대하는 이메일 기능들:
- [ ] 이메일 템플릿 관리 API
- [ ] 이메일 발송 API 
- [ ] 이메일 발송 이력 API

**주의**: 이 기능들은 Backend PRD MVP 범위에 포함되지 않음. 필요시 별도 개발 필요.

### 🧪 5. 테스트 및 검증

#### API 테스트
```bash
# 개발 서버 실행
npm run dev

# API 엔드포인트 테스트 (Postman 또는 curl 사용)
# 1. 인증 테스트
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# 2. 데이터 조회 테스트  
curl -X GET http://localhost:3000/api/data/users-inquiries \
  -H "Authorization: Bearer [session_token]"
```

#### 프론트엔드 통합 테스트
- [ ] 로그인/로그아웃 기능 테스트
- [ ] 대시보드 데이터 로딩 테스트
- [ ] 사용자-문의 테이블 조회 테스트
- [ ] 필터링 및 페이지네이션 테스트

### 🚀 6. 배포 및 운영

#### Vercel 배포 설정
```bash
# vercel.json 파일 생성 (이미 있음)
# 환경 변수를 Vercel 대시보드에서 설정
```

#### 필요한 환경 변수 (Vercel):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`

### 📈 7. 성능 최적화 (선택사항)

#### API 응답 시간 최적화
- [ ] 데이터베이스 인덱스 최적화
- [ ] 복잡한 조인 쿼리 성능 튜닝
- [ ] API 응답 캐싱 구현 (Next.js revalidate)

#### 프론트엔드 최적화
- [ ] React Query 또는 SWR 도입 (데이터 캐싱)
- [ ] 무한 스크롤 또는 가상화 (대량 데이터 처리)

## 개발 우선순위

### 🔥 즉시 필요 (1-2일)
1. ✅ **환경 설정 및 Supabase 연결**
2. ✅ **관리자 계정 생성 및 RLS 정책 적용**
3. ✅ **기본 API 테스트 및 검증**

### 📋 단기 목표 (1주)
4. ✅ **데이터 타입 및 응답 형식 통일**
5. ✅ **프론트엔드 인증 흐름 개선**
6. ✅ **통합 테스트 완료**

### 🎯 중기 목표 (2-4주)
7. ✅ **이메일 기능 구현** (필요시)
8. ✅ **성능 최적화**
9. ✅ **배포 및 운영 환경 구축**

## 참고 자료

- [Backend PRD 문서](./Backend-Admin-PRD.md)
- [Frontend PRD 문서](./Frontend-Admin-PRD.md)
- [Supabase 문서](https://supabase.com/docs)
- [Drizzle ORM 문서](https://orm.drizzle.team)
- [Next.js API Routes 문서](https://nextjs.org/docs/api-routes/introduction)

---

**작성일**: 2025-01-17  
**최종 업데이트**: 2025-01-17  
**담당자**: Backend 개발팀