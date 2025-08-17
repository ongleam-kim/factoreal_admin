import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, FileText, TrendingUp } from 'lucide-react';

export default function Home() {
  // TODO: 실제 데이터는 API에서 가져오기
  const stats = {
    totalUsers: 1234,
    totalInquiries: 567,
    emailTemplates: 12,
    emailsSent: 89,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground">전체 시스템 현황을 확인할 수 있습니다.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">
              <span className="text-green-600">+12%</span> 전월 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 문의</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInquiries.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">
              <span className="text-green-600">+8%</span> 전월 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이메일 템플릿</CardTitle>
            <Mail className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailTemplates}</div>
            <p className="text-muted-foreground text-xs">활성 템플릿 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">발송된 이메일</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailsSent}</div>
            <p className="text-muted-foreground text-xs">오늘 발송</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>최근 문의</CardTitle>
            <CardDescription>최근 등록된 문의 내역입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* TODO: 실제 데이터로 교체 */}
              <div className="flex items-center space-x-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">김철수</p>
                  <p className="text-muted-foreground text-sm">기술 문의 - API 연동 관련</p>
                </div>
                <Badge variant="outline">진행중</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">이영희</p>
                  <p className="text-muted-foreground text-sm">일반 문의 - 가격 정책</p>
                </div>
                <Badge variant="secondary">대기</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">박민수</p>
                  <p className="text-muted-foreground text-sm">파트너십 문의</p>
                </div>
                <Badge variant="default">완료</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>시스템 상태</CardTitle>
            <CardDescription>현재 시스템 운영 상태입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">API 서버</span>
                <Badge variant="default">정상</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">데이터베이스</span>
                <Badge variant="default">정상</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">이메일 서비스</span>
                <Badge variant="default">정상</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">파일 스토리지</span>
                <Badge variant="secondary">점검중</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
