import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, FileText, TrendingUp } from 'lucide-react';
import { createSupabaseAdminClient } from '@/lib/db/supabase';

// 대시보드 데이터 타입
interface DashboardStats {
  totalUsers: number;
  totalInquiries: number;
  pendingInquiries: number;
  processingInquiries: number;
  resolvedInquiries: number;
}

interface RecentInquiry {
  id: string;
  inquiry_type: string;
  inquiry_message: string | null;
  status: string;
  created_at: string;
  users: {
    name: string | null;
    email: string;
  } | null;
}

async function getDashboardData(): Promise<{
  stats: DashboardStats;
  recentInquiries: RecentInquiry[];
} | null> {
  try {
    const supabase = createSupabaseAdminClient();

    // 총 사용자 수
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // 총 문의 수
    const { count: totalInquiries } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true });

    // 최근 문의 5개 (사용자 정보와 함께)
    const { data: recentInquiries } = await supabase
      .from('inquiries')
      .select(
        `
        id,
        inquiry_type,
        inquiry_message,
        status,
        created_at,
        users (
          name,
          email
        )
      `
      )
      .order('created_at', { ascending: false })
      .limit(5);

    // 상태별 문의 수
    const { data: statusCounts } = await supabase.from('inquiries').select('status');

    const statusStats =
      statusCounts?.reduce(
        (acc, inquiry) => {
          acc[inquiry.status] = (acc[inquiry.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ) || {};

    return {
      stats: {
        totalUsers: totalUsers || 0,
        totalInquiries: totalInquiries || 0,
        pendingInquiries: statusStats.PENDING || 0,
        processingInquiries: statusStats.PROCESSING || 0,
        resolvedInquiries: statusStats.RESOLVED || 0,
      },
      recentInquiries: (recentInquiries || []).map((inquiry: any) => ({
        id: inquiry.id,
        inquiry_type: inquiry.inquiry_type,
        inquiry_message: inquiry.inquiry_message,
        status: inquiry.status,
        created_at: inquiry.created_at,
        users: {
          name: inquiry.users?.[0]?.name || null,
          email: inquiry.users?.[0]?.email || '',
        },
      })) as RecentInquiry[],
    };
  } catch (error) {
    console.error('대시보드 데이터 로딩 실패:', error);
    return null;
  }
}

export default async function Home() {
  const data = await getDashboardData();

  // 기본값 설정 (API 실패 시)
  const stats = data?.stats || {
    totalUsers: 0,
    totalInquiries: 0,
    pendingInquiries: 0,
    processingInquiries: 0,
    resolvedInquiries: 0,
  };

  const recentInquiries = data?.recentInquiries || [];

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
            <p className="text-muted-foreground text-xs">등록된 사용자 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 문의</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInquiries.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">전체 문의 건수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기 중 문의</CardTitle>
            <Mail className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInquiries}</div>
            <p className="text-muted-foreground text-xs">처리 대기 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">처리 완료</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolvedInquiries}</div>
            <p className="text-muted-foreground text-xs">완료된 문의</p>
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
              {recentInquiries.length > 0 ? (
                recentInquiries.map((inquiry) => {
                  const userName = inquiry.users?.name || inquiry.users?.email || '익명 사용자';
                  const inquiryTypeKorean =
                    inquiry.inquiry_type === 'URL_VERIFICATION' ? 'URL 검증' : '일반 문의';
                  const message = inquiry.inquiry_message
                    ? inquiry.inquiry_message.substring(0, 50) +
                      (inquiry.inquiry_message.length > 50 ? '...' : '')
                    : inquiryTypeKorean;

                  const getStatusBadge = (status: string) => {
                    switch (status) {
                      case 'PENDING':
                        return <Badge variant="secondary">대기</Badge>;
                      case 'PROCESSING':
                        return <Badge variant="outline">진행중</Badge>;
                      case 'RESOLVED':
                        return <Badge variant="default">완료</Badge>;
                      case 'CLOSED':
                        return <Badge variant="destructive">종료</Badge>;
                      default:
                        return <Badge variant="secondary">{status}</Badge>;
                    }
                  };

                  return (
                    <div key={inquiry.id} className="flex items-center space-x-4">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{userName}</p>
                        <p className="text-muted-foreground text-sm">{message}</p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      {getStatusBadge(inquiry.status)}
                    </div>
                  );
                })
              ) : (
                <div className="text-muted-foreground py-4 text-center">문의가 없습니다.</div>
              )}
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
