import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/db/supabase';
import { db, users, inquiries } from '@/lib/db';
import { count, sql, gte } from 'drizzle-orm';

// Authentication middleware
async function checkAuth() {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Unauthorized');
  }
  
  // Check admin role
  const userRole = user.user_metadata?.role || 'user';
  if (userRole !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return user;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    await checkAuth();
    
    // Calculate date ranges
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get user statistics
    const [userStats] = await db
      .select({
        total: count(),
        newThisMonth: sql<number>`COUNT(CASE WHEN ${users.createdAt} >= ${thisMonthStart} THEN 1 END)`,
        activeThisMonth: sql<number>`COUNT(CASE WHEN ${users.lastLoginAt} >= ${thisMonthStart} THEN 1 END)`
      })
      .from(users);

    // Get inquiry statistics
    const [inquiryStats] = await db
      .select({
        total: count(),
        pending: sql<number>`COUNT(CASE WHEN ${inquiries.status} = 'pending' THEN 1 END)`,
        resolved: sql<number>`COUNT(CASE WHEN ${inquiries.status} = 'resolved' THEN 1 END)`
      })
      .from(inquiries);

    // Get inquiry breakdown by type
    const inquiryByType = await db
      .select({
        type: inquiries.type,
        count: count()
      })
      .from(inquiries)
      .groupBy(inquiries.type);

    // Get inquiry breakdown by status
    const inquiryByStatus = await db
      .select({
        status: inquiries.status,
        count: count()
      })
      .from(inquiries)
      .groupBy(inquiries.status);

    // Get trends for last 7 days (inquiries by day)
    const inquiriesByDay = await db
      .select({
        date: sql<string>`DATE(${inquiries.createdAt})`,
        count: count()
      })
      .from(inquiries)
      .where(gte(inquiries.createdAt, last7Days))
      .groupBy(sql`DATE(${inquiries.createdAt})`)
      .orderBy(sql`DATE(${inquiries.createdAt})`);

    // Get user registration trends for last 7 days
    const usersByDay = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count()
      })
      .from(users)
      .where(gte(users.createdAt, last7Days))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: userStats.total,
          newThisMonth: userStats.newThisMonth,
          activeThisMonth: userStats.activeThisMonth
        },
        inquiries: {
          total: inquiryStats.total,
          pending: inquiryStats.pending,
          resolved: inquiryStats.resolved,
          byType: inquiryByType.map(item => ({
            type: item.type,
            count: item.count
          })),
          byStatus: inquiryByStatus.map(item => ({
            status: item.status,
            count: item.count
          }))
        },
        trends: {
          inquiriesByDay: inquiriesByDay.map(item => ({
            date: item.date,
            count: item.count
          })),
          usersByDay: usersByDay.map(item => ({
            date: item.date,
            count: item.count
          }))
        }
      }
    });

  } catch (error) {
    console.error('Dashboard analytics API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}