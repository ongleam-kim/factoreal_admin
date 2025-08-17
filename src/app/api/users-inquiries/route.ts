import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/db/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();

    // URL 파라미터 추출
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 기본 쿼리 - 사용자와 문의를 조인
    let query = supabase
      .from('inquiries')
      .select(
        `
        id,
        inquiry_type,
        inquiry_message,
        status,
        created_at,
        updated_at,
        url,
        company_name,
        users (
          id,
          name,
          email,
          company_name,
          created_at
        )
      `
      )
      .order('created_at', { ascending: false });

    // 검색 조건 추가 - 프론트엔드에서 필터링 방식으로 변경
    // 일단 모든 데이터를 가져온 후 프론트엔드에서 필터링하도록 단순화

    // 페이지네이션
    query = query.range(offset, offset + limit - 1);

    const { data: inquiries, error: inquiriesError } = await query;

    if (inquiriesError) {
      console.error('문의 조회 실패:', inquiriesError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch inquiries',
          details: inquiriesError,
        },
        { status: 500 }
      );
    }

    // 총 개수 조회 (검색 조건 포함)
    const countQuery = supabase.from('inquiries').select('*', { count: 'exact', head: true });

    // 검색은 프론트엔드에서 처리

    const { count: totalCount } = await countQuery;

    // 데이터 변환 - 기존 mock 데이터 구조와 맞추기
    const transformedData = (inquiries || []).map((inquiry) => ({
      user: {
        id: inquiry.users?.[0]?.id || '',
        name: inquiry.users?.[0]?.name || inquiry.users?.[0]?.email || '익명 사용자',
        email: inquiry.users?.[0]?.email || '',
        companyName: inquiry.users?.[0]?.company_name || inquiry.company_name || null,
        registeredAt: new Date(inquiry.users?.[0]?.created_at || inquiry.created_at),
      },
      inquiry: {
        id: inquiry.id,
        userId: inquiry.users?.[0]?.id || '',
        type: inquiry.inquiry_type === 'URL_VERIFICATION' ? 'technical' : 'general',
        title: inquiry.inquiry_message
          ? inquiry.inquiry_message.substring(0, 50) +
            (inquiry.inquiry_message.length > 50 ? '...' : '')
          : inquiry.inquiry_type === 'URL_VERIFICATION'
            ? 'URL 검증 요청'
            : '일반 문의',
        content: inquiry.inquiry_message || '',
        status: inquiry.status
          .toLowerCase()
          .replace('pending', 'pending')
          .replace('processing', 'in_progress')
          .replace('resolved', 'resolved')
          .replace('closed', 'closed'),
        createdAt: new Date(inquiry.created_at),
        updatedAt: new Date(inquiry.updated_at),
        responseCount: 0, // TODO: 실제 응답 수 계산
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: transformedData,
        total: totalCount || 0,
        limit,
        offset,
        hasMore: offset + limit < (totalCount || 0),
      },
    });
  } catch (error) {
    console.error('사용자-문의 API 오류:', error);
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
