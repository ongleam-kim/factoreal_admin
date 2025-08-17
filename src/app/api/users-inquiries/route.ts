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
      .select(`
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
      `)
      .order('created_at', { ascending: false });
    
    // 검색 조건 추가 - 단계별 접근 방식
    if (search) {
      // 1단계: 사용자 테이블에서 검색 조건에 맞는 사용자 ID 찾기
      const { data: matchingUsers } = await supabase
        .from('users')
        .select('id')
        .or(`name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
      
      const matchingUserIds = matchingUsers?.map(user => user.id) || [];
      
      // 2단계: 문의 테이블에서 검색 (문의 내용 또는 매칭된 사용자 ID)
      if (matchingUserIds.length > 0) {
        query = query.or(`inquiry_message.ilike.%${search}%,company_name.ilike.%${search}%,user_id.in.(${matchingUserIds.join(',')})`);
      } else {
        // 사용자 매칭이 없으면 문의 내용과 회사명만 검색
        query = query.or(`inquiry_message.ilike.%${search}%,company_name.ilike.%${search}%`);
      }
    }
    
    // 페이지네이션
    query = query.range(offset, offset + limit - 1);
    
    const { data: inquiries, error: inquiriesError } = await query;
    
    if (inquiriesError) {
      console.error('문의 조회 실패:', inquiriesError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch inquiries',
        details: inquiriesError
      }, { status: 500 });
    }
    
    // 총 개수 조회 (검색 조건 포함)
    let countQuery = supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true });
    
    if (search) {
      // 카운트 쿼리에도 동일한 검색 조건 적용
      const { data: matchingUsersForCount } = await supabase
        .from('users')
        .select('id')
        .or(`name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
      
      const matchingUserIdsForCount = matchingUsersForCount?.map(user => user.id) || [];
      
      if (matchingUserIdsForCount.length > 0) {
        countQuery = countQuery.or(`inquiry_message.ilike.%${search}%,company_name.ilike.%${search}%,user_id.in.(${matchingUserIdsForCount.join(',')})`);
      } else {
        countQuery = countQuery.or(`inquiry_message.ilike.%${search}%,company_name.ilike.%${search}%`);
      }
    }
    
    const { count: totalCount } = await countQuery;
    
    // 데이터 변환 - 기존 mock 데이터 구조와 맞추기
    const transformedData = (inquiries || []).map(inquiry => ({
      user: {
        id: inquiry.users?.id || '',
        name: inquiry.users?.name || inquiry.users?.email || '익명 사용자',
        email: inquiry.users?.email || '',
        companyName: inquiry.users?.company_name || inquiry.company_name || null,
        registeredAt: new Date(inquiry.users?.created_at || inquiry.created_at),
      },
      inquiry: {
        id: inquiry.id,
        userId: inquiry.users?.id || '',
        type: inquiry.inquiry_type === 'URL_VERIFICATION' ? 'technical' : 'general',
        title: inquiry.inquiry_message 
          ? inquiry.inquiry_message.substring(0, 50) + (inquiry.inquiry_message.length > 50 ? '...' : '')
          : (inquiry.inquiry_type === 'URL_VERIFICATION' ? 'URL 검증 요청' : '일반 문의'),
        content: inquiry.inquiry_message || '',
        status: inquiry.status.toLowerCase().replace('pending', 'pending').replace('processing', 'in_progress').replace('resolved', 'resolved').replace('closed', 'closed'),
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
        hasMore: (offset + limit) < (totalCount || 0)
      }
    });
    
  } catch (error) {
    console.error('사용자-문의 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}