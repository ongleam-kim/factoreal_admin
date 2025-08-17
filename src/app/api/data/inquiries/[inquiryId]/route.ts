import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/db/supabase';
import { db, users, inquiries } from '@/lib/db';
import { eq } from 'drizzle-orm';

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
  { params }: { params: { inquiryId: string } }
) {
  try {
    // Check authentication
    await checkAuth();
    
    const { inquiryId } = params;
    
    if (!inquiryId) {
      return NextResponse.json(
        { success: false, error: 'Inquiry ID is required' },
        { status: 400 }
      );
    }

    // Get inquiry details with user information
    const result = await db
      .select({
        inquiry: inquiries,
        user: users
      })
      .from(inquiries)
      .leftJoin(users, eq(inquiries.userId, users.id))
      .where(eq(inquiries.id, inquiryId))
      .limit(1);

    if (!result.length) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    const { inquiry, user } = result[0];

    return NextResponse.json({
      success: true,
      data: {
        inquiry,
        user
      }
    });

  } catch (error) {
    console.error('Inquiry detail API error:', error);
    
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