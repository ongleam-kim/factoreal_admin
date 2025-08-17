import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/db/supabase';
import { db, users, inquiries } from '@/lib/db';
import { eq, count, sql } from 'drizzle-orm';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check authentication
    await checkAuth();
    
    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user details
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's inquiries
    const userInquiries = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.userId, userId))
      .orderBy(inquiries.createdAt);

    // Get user stats
    const [stats] = await db
      .select({
        totalInquiries: count(),
        resolvedInquiries: sql<number>`COUNT(CASE WHEN ${inquiries.status} = 'resolved' THEN 1 END)`,
        pendingInquiries: sql<number>`COUNT(CASE WHEN ${inquiries.status} = 'pending' THEN 1 END)`
      })
      .from(inquiries)
      .where(eq(inquiries.userId, userId));

    return NextResponse.json({
      success: true,
      data: {
        user,
        inquiries: userInquiries,
        stats: {
          totalInquiries: stats.totalInquiries,
          resolvedInquiries: stats.resolvedInquiries,
          pendingInquiries: stats.pendingInquiries
        }
      }
    });

  } catch (error) {
    console.error('User detail API error:', error);
    
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