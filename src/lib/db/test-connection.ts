// 기존 데이터베이스 연결 및 스키마 확인 스크립트
import { createSupabaseAdminClient } from './supabase';

export async function testDatabaseConnection() {
  try {
    const supabase = createSupabaseAdminClient();
    
    console.log('🔌 데이터베이스 연결 테스트 중...');
    
    // 1. 연결 테스트
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ 연결 실패:', healthError);
      return false;
    }
    
    console.log('✅ 데이터베이스 연결 성공!');
    
    // 2. 기존 테이블 구조 확인
    console.log('\n📊 기존 테이블 구조 분석...');
    
    // users 테이블 스키마 확인
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (!usersError && usersData?.length > 0) {
      console.log('👥 Users 테이블 스키마:', Object.keys(usersData[0]));
    }
    
    // inquiries 테이블 스키마 확인
    const { data: inquiriesData, error: inquiriesError } = await supabase
      .from('inquiries')
      .select('*')
      .limit(1);
    
    if (!inquiriesError && inquiriesData?.length > 0) {
      console.log('📝 Inquiries 테이블 스키마:', Object.keys(inquiriesData[0]));
    }
    
    // 3. 데이터 개수 확인
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    const { count: inquiryCount } = await supabase
      .from('inquiries') 
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n📈 데이터 현황:`);
    console.log(`- Users: ${userCount}개`);
    console.log(`- Inquiries: ${inquiryCount}개`);
    
    return true;
    
  } catch (error) {
    console.error('❌ 데이터베이스 테스트 실패:', error);
    return false;
  }
}

// 샘플 데이터 조회
export async function fetchSampleData() {
  try {
    const supabase = createSupabaseAdminClient();
    
    console.log('\n🔍 샘플 데이터 조회...');
    
    // 최근 사용자 5명
    const { data: recentUsers } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log('👥 최근 사용자 5명:', recentUsers);
    
    // 최근 문의 5개
    const { data: recentInquiries } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log('📝 최근 문의 5개:', recentInquiries);
    
    return { recentUsers, recentInquiries };
    
  } catch (error) {
    console.error('❌ 샘플 데이터 조회 실패:', error);
    return null;
  }
}