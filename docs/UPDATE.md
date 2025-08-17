# Factoreal Admin Dashboard - 대규모 멀티서비스 아키텍처 업데이트 계획

## 🎯 현재 상황

### 현재 구조 (MVP 완료)
- **Single Service Admin**: 현재 users/inquiries 테이블만 관리
- **Supabase + Drizzle ORM**: 직접 DB 연결 방식
- **Static Schema**: 스키마 변경 시 Admin 코드 수정 필요

### 예상 확장 요구사항
- **5개 이상 서비스**: user-service, inquiry-service, payment-service, notification-service, analytics-service 등
- **독립적 서비스 개발**: 각 서비스별 팀, DB, 배포 주기
- **Schema 변경 빈도**: 서비스별 스키마 변경이 Admin에 영향 주지 않아야 함

## 🏗️ 추천 아키텍처: Federated Admin Pattern

### Core Concept
```typescript
// Admin 서비스 = 순수한 데이터 애그리게이터 + UI
// 각 서비스 = 독립적인 API + 자체 스키마 관리
```

### 1. Service Contract 기반 구조

#### 표준 Service Contract
```typescript
// src/lib/contracts/base.ts
interface ServiceContract {
  name: string;
  version: string;
  endpoints: {
    health: string;
    schema: string;
    admin: string;
  };
  adminCapabilities: AdminCapability[];
}

interface AdminCapability {
  type: 'list' | 'detail' | 'stats' | 'action';
  resource: string;
  endpoint: string;
  schema: JSONSchema;
}

// 각 서비스가 구현해야 하는 표준 계약
const USER_SERVICE_CONTRACT: ServiceContract = {
  name: 'user-service',
  version: '2.1.0',
  endpoints: {
    health: '/health',
    schema: '/admin/schema',
    admin: '/admin'
  },
  adminCapabilities: [
    {
      type: 'list',
      resource: 'users',
      endpoint: '/admin/users',
      schema: userListSchema
    },
    {
      type: 'stats', 
      resource: 'users',
      endpoint: '/admin/stats',
      schema: userStatsSchema
    }
  ]
};
```

### 2. Dynamic Service Discovery

#### Service Registry 시스템
```typescript
// src/lib/discovery/registry.ts
class ServiceDiscovery {
  private services = new Map<string, ServiceContract>();
  
  async discoverServices() {
    const serviceUrls = process.env.SERVICE_URLS?.split(',') || [];
    
    for (const url of serviceUrls) {
      try {
        // 각 서비스의 /admin/contract 엔드포인트 호출
        const contract = await fetch(`${url}/admin/contract`).then(r => r.json());
        await this.validateContract(contract);
        this.services.set(contract.name, contract);
      } catch (error) {
        console.warn(`Service ${url} not available:`, error);
      }
    }
  }
  
  getAvailableServices(): ServiceContract[] {
    return Array.from(this.services.values());
  }
}

// src/app/api/admin/services/route.ts
export async function GET() {
  const discovery = new ServiceDiscovery();
  await discovery.discoverServices();
  
  return NextResponse.json({
    services: discovery.getAvailableServices(),
    lastDiscovery: new Date().toISOString()
  });
}
```

### 3. Universal Admin API Proxy

#### 통합 API Gateway
```typescript
// src/app/api/admin/proxy/[...service]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { service: string[] } }
) {
  const [serviceName, ...path] = params.service;
  const query = request.nextUrl.searchParams.toString();
  
  // Service Registry에서 서비스 정보 조회
  const service = await serviceRegistry.getService(serviceName);
  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }
  
  // 인증 정보 전달
  const authHeader = request.headers.get('authorization');
  
  // 해당 서비스로 프록시
  const targetUrl = `${service.baseUrl}/admin/${path.join('/')}?${query}`;
  const response = await fetch(targetUrl, {
    headers: {
      'Authorization': authHeader,
      'X-Admin-Request': 'true',
      'X-Source-Service': 'admin-dashboard'
    }
  });
  
  const data = await response.json();
  
  // 응답 표준화
  return NextResponse.json({
    success: response.ok,
    data: data,
    source: serviceName,
    timestamp: new Date().toISOString()
  });
}
```

### 4. Dynamic UI Component Generation

#### 스키마 기반 UI 자동 생성
```typescript
// src/components/admin/DynamicServiceView.tsx
interface ServiceViewProps {
  serviceName: string;
  capability: AdminCapability;
}

export function DynamicServiceView({ serviceName, capability }: ServiceViewProps) {
  const { data, loading } = useServiceData(serviceName, capability.endpoint);
  
  // 스키마 기반 UI 자동 생성
  switch (capability.type) {
    case 'list':
      return <DataTable schema={capability.schema} data={data} />;
    case 'stats':
      return <StatsCard schema={capability.schema} data={data} />;
    case 'detail':
      return <DetailView schema={capability.schema} data={data} />;
    default:
      return <GenericView data={data} />;
  }
}

// src/app/admin/[service]/page.tsx
export default function ServiceAdminPage({ params }: { params: { service: string } }) {
  const { data: serviceContract } = useServiceContract(params.service);
  
  if (!serviceContract) return <ServiceNotFound />;
  
  return (
    <div className="service-admin">
      <h1>{serviceContract.name} Management</h1>
      {serviceContract.adminCapabilities.map((capability) => (
        <DynamicServiceView 
          key={capability.resource}
          serviceName={params.service}
          capability={capability}
        />
      ))}
    </div>
  );
}
```

### 5. 각 서비스의 Admin API 표준

#### 표준 Admin API 구현 예시
```typescript
// 각 서비스에서 구현해야 하는 Admin API 예시
// user-service/src/routes/admin.ts

app.get('/admin/contract', (req, res) => {
  res.json({
    name: 'user-service',
    version: '2.1.0',
    adminCapabilities: [
      {
        type: 'list',
        resource: 'users',
        endpoint: '/admin/users',
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
      }
    ]
  });
});

app.get('/admin/users', async (req, res) => {
  // 표준화된 쿼리 파라미터 처리
  const { page = 1, limit = 20, search, filters } = req.query;
  
  const users = await userService.getUsers({
    page: Number(page),
    limit: Math.min(Number(limit), 100),
    search: search as string,
    filters: JSON.parse(filters as string || '{}')
  });
  
  // 표준화된 응답 형식
  res.json({
    success: true,
    data: users.items,
    pagination: {
      page: users.page,
      totalPages: users.totalPages,
      totalCount: users.totalCount
    },
    meta: {
      service: 'user-service',
      version: '2.1.0',
      timestamp: new Date().toISOString()
    }
  });
});
```

## 🚀 핵심 장점 (5+ 서비스 환경)

### 1. 완전한 서비스 독립성
- 각 서비스가 자체 DB, 스키마, 비즈니스 로직 유지
- Admin 서비스 장애가 개별 서비스에 영향 없음
- 서비스별 독립적인 배포 및 확장

### 2. Zero-Touch Service Addition
```bash
# 새 서비스 추가 시
# 1. 서비스에 Admin API 구현 (표준 contract 따라)
# 2. 환경변수에 URL만 추가
SERVICE_URLS="user-service.com,inquiry-service.com,payment-service.com,notification-service.com,analytics-service.com"

# 3. Admin에서 자동 감지됨 (코드 변경 없음)
```

### 3. 확장성과 성능
```typescript
// 병렬 데이터 로딩
const dashboardData = await Promise.allSettled([
  fetchServiceData('user-service', '/admin/stats'),
  fetchServiceData('inquiry-service', '/admin/stats'), 
  fetchServiceData('payment-service', '/admin/stats'),
  fetchServiceData('notification-service', '/admin/stats'),
  fetchServiceData('analytics-service', '/admin/stats')
]);
```

### 4. 서비스별 특화 UI
```typescript
// 각 서비스의 특수한 관리 기능도 수용 가능
const SERVICE_SPECIFIC_COMPONENTS = {
  'payment-service': lazy(() => import('@/components/PaymentAdminTools')),
  'analytics-service': lazy(() => import('@/components/AnalyticsDashboard')),
  'notification-service': lazy(() => import('@/components/NotificationCenter'))
};
```

## 💡 구현 로드맵

### Week 1: Foundation
- [ ] Service Registry 구현
- [ ] Contract 표준 정의
- [ ] Discovery 시스템 구축

### Week 2: Core Features  
- [ ] Admin API Proxy 구현
- [ ] Dynamic UI Component 시스템
- [ ] 첫 번째 서비스 연동 (현재 users/inquiries)

### Week 3: Scale Testing
- [ ] 2-3개 더미 서비스로 확장성 테스트
- [ ] 성능 최적화 (캐싱, 병렬 처리)

### Week 4: Production Ready
- [ ] 오류 처리 및 회복력 구현
- [ ] 모니터링 및 헬스체크
- [ ] 문서화 및 가이드

## 🔄 Migration Strategy (현재 → 신규 아키텍처)

### Phase 1: 현재 구조 유지하며 기반 구축
```typescript
// 현재 Supabase 구조를 하나의 "legacy-service"로 취급
const LEGACY_SERVICE_CONTRACT: ServiceContract = {
  name: 'legacy-service',
  version: '1.0.0',
  endpoints: {
    health: '/api/health',
    schema: '/api/schema', 
    admin: '/api'
  },
  adminCapabilities: [
    {
      type: 'list',
      resource: 'users-inquiries',
      endpoint: '/api/data/users-inquiries',
      schema: currentUsersInquiriesSchema
    }
  ]
};
```

### Phase 2: 점진적 서비스 분리
- 새로운 서비스들은 신규 아키텍처로 구현
- 기존 legacy-service는 그대로 유지
- Admin UI에서 두 방식 모두 지원

### Phase 3: Legacy 마이그레이션
- 적절한 시점에 legacy-service를 개별 서비스로 분리
- 무중단 마이그레이션 가능

## 🎯 예상 효과

### 확장성
- **10개, 20개 서비스로 확장해도 Admin 코드 변경 없음**
- 새 서비스 추가 시 Admin 개발팀 개입 불필요

### 유지보수성  
- 각 서비스 팀이 자체 Admin API 관리
- Schema 변경이 다른 서비스에 영향 없음
- 장애 격리 및 독립적 배포

### 개발 생산성
- 표준화된 Admin API로 일관성 유지
- 동적 UI 생성으로 반복 작업 최소화
- 서비스별 특화 기능도 유연하게 지원

---

**문서 작성일**: 2025-01-17  
**검토 예정일**: 향후 논의 시점  
**작성자**: Backend 아키텍처 팀