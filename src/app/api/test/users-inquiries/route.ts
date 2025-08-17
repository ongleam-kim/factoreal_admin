import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/db/supabase';

// 테스트용 API - 인증 없이 데이터 조회
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 테스트 API 호출됨');

    const supabase = createSupabaseAdminClient();

    // 1. 기본 사용자 데이터 조회
    const { data: users, error: usersError } = await supabase.from('users').select('*');

    if (usersError) {
      console.error('Users 조회 실패:', usersError);
      return NextResponse.json({ error: 'Users query failed', details: usersError });
    }

    // 2. 기본 문의 데이터 조회
    const { data: inquiries, error: inquiriesError } = await supabase.from('inquiries').select('*');

    if (inquiriesError) {
      console.error('Inquiries 조회 실패:', inquiriesError);
      return NextResponse.json({ error: 'Inquiries query failed', details: inquiriesError });
    }

    // 3. 조인 데이터 조회
    const { data: joinedData, error: joinError } = await supabase.from('inquiries').select(`
        *,
        users:user_id (*)
      `);

    if (joinError) {
      console.error('조인 조회 실패:', joinError);
      // 조인 실패해도 계속 진행
    }

    // 4. 통계 데이터
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: inquiryCount } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true });

    console.log('✅ 테스트 API 성공');

    return NextResponse.json({
      success: true,
      data: {
        users: users || [],
        inquiries: inquiries || [],
        joinedData: joinedData || [],
        stats: {
          userCount: userCount || 0,
          inquiryCount: inquiryCount || 0,
        },
      },
    });
  } catch (error) {
    console.error('❌ 테스트 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
