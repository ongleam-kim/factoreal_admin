import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/db/supabase';

export async function GET() {
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

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers: totalUsers || 0,
          totalInquiries: totalInquiries || 0,
          pendingInquiries: statusStats.PENDING || 0,
          processingInquiries: statusStats.PROCESSING || 0,
          resolvedInquiries: statusStats.RESOLVED || 0,
        },
        recentInquiries: recentInquiries || [],
      },
    });
  } catch (error) {
    console.error('Dashboard API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
