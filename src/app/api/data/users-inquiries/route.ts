import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/db/supabase';
import { db, users, inquiries } from '@/lib/db';
import { z } from 'zod';
import { eq, and, or, like, desc, asc, gte, lte, sql, count } from 'drizzle-orm';

// Validation schema for query parameters
const querySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val) || 20, 100) : 20),
  sortBy: z.enum(['user_name', 'company_name', 'inquiry_created_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  inquiryType: z.string().optional().transform(val => val ? val.split(',') : undefined),
  inquiryStatus: z.string().optional().transform(val => val ? val.split(',') : undefined),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional()
});

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
    
    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const validation = querySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const {
      page,
      limit,
      sortBy,
      sortOrder,
      inquiryType,
      inquiryStatus,
      dateFrom,
      dateTo,
      search
    } = validation.data;

    // Build query conditions
    const conditions = [];
    
    if (inquiryType && inquiryType.length > 0) {
      conditions.push(sql`${inquiries.type} = ANY(${inquiryType})`);
    }
    
    if (inquiryStatus && inquiryStatus.length > 0) {
      conditions.push(sql`${inquiries.status} = ANY(${inquiryStatus})`);
    }
    
    if (dateFrom) {
      conditions.push(gte(inquiries.createdAt, new Date(dateFrom)));
    }
    
    if (dateTo) {
      conditions.push(lte(inquiries.createdAt, new Date(dateTo)));
    }
    
    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.companyName, `%${search}%`),
          like(inquiries.title, `%${search}%`)
        )
      );
    }

    // Build sorting
    let orderBy;
    if (sortBy === 'user_name') {
      orderBy = sortOrder === 'asc' ? asc(users.name) : desc(users.name);
    } else if (sortBy === 'company_name') {
      orderBy = sortOrder === 'asc' ? asc(users.companyName) : desc(users.companyName);
    } else {
      orderBy = sortOrder === 'asc' ? asc(inquiries.createdAt) : desc(inquiries.createdAt);
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Main query with join and user stats
    const baseQuery = db
      .select({
        user_id: users.id,
        user_name: users.name,
        user_email: users.email,
        company_name: users.companyName,
        user_registered_at: users.createdAt,
        last_login_at: users.lastLoginAt,
        inquiry_id: inquiries.id,
        inquiry_type: inquiries.type,
        inquiry_title: inquiries.title,
        inquiry_status: inquiries.status,
        priority: inquiries.priority,
        inquiry_created_at: inquiries.createdAt,
        inquiry_updated_at: inquiries.updatedAt,
        // Calculate stats using window functions
        total_inquiries: sql<number>`COUNT(*) OVER (PARTITION BY ${users.id})`,
        resolved_inquiries: sql<number>`COUNT(CASE WHEN ${inquiries.status} = 'resolved' THEN 1 END) OVER (PARTITION BY ${users.id})`
      })
      .from(users)
      .leftJoin(inquiries, eq(users.id, inquiries.userId));

    // Apply conditions
    let query = baseQuery;
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Execute main query with pagination
    const results = await query
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    let countQuery = db
      .select({ count: count() })
      .from(users)
      .leftJoin(inquiries, eq(users.id, inquiries.userId));
    
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    
    const [{ count: totalCount }] = await countQuery;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Users-inquiries API error:', error);
    
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