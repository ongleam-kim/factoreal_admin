import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/db/supabase';
import { db, inquiries } from '@/lib/db';
import { z } from 'zod';
import { count, sql, gte, lte, and } from 'drizzle-orm';

// Validation schema for query parameters
const querySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
});

// Authentication middleware
async function checkAuth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

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
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { dateFrom, dateTo, groupBy } = validation.data;

    // Build date conditions
    const conditions: any[] = [];
    if (dateFrom) {
      conditions.push(gte(inquiries.createdAt, new Date(dateFrom)));
    }
    if (dateTo) {
      conditions.push(lte(inquiries.createdAt, new Date(dateTo)));
    }

    // Get total count
    const totalCountQuery =
      conditions.length > 0
        ? db
            .select({ count: count() })
            .from(inquiries)
            .where(and(...conditions))
        : db.select({ count: count() }).from(inquiries);
    const [{ count: totalCount }] = await totalCountQuery;

    // Get breakdown by type
    const byTypeQuery =
      conditions.length > 0
        ? db
            .select({
              type: inquiries.inquiryType,
              count: count(),
            })
            .from(inquiries)
            .where(and(...conditions))
            .groupBy(inquiries.inquiryType)
        : db
            .select({
              type: inquiries.inquiryType,
              count: count(),
            })
            .from(inquiries)
            .groupBy(inquiries.inquiryType);
    const byType = await byTypeQuery;

    // Get breakdown by status
    const byStatusQuery =
      conditions.length > 0
        ? db
            .select({
              status: inquiries.status,
              count: count(),
            })
            .from(inquiries)
            .where(and(...conditions))
            .groupBy(inquiries.status)
        : db
            .select({
              status: inquiries.status,
              count: count(),
            })
            .from(inquiries)
            .groupBy(inquiries.status);
    const byStatus = await byStatusQuery;

    // Get time series data based on groupBy parameter
    let dateFormat: string;
    switch (groupBy) {
      case 'week':
        dateFormat = `DATE_TRUNC('week', ${inquiries.createdAt})`;
        break;
      case 'month':
        dateFormat = `DATE_TRUNC('month', ${inquiries.createdAt})`;
        break;
      default: // day
        dateFormat = `DATE(${inquiries.createdAt})`;
    }

    const timeSeriesQuery =
      conditions.length > 0
        ? db
            .select({
              date: sql<string>`${sql.raw(dateFormat)}`,
              count: count(),
            })
            .from(inquiries)
            .where(and(...conditions))
            .groupBy(sql.raw(dateFormat))
            .orderBy(sql.raw(dateFormat))
        : db
            .select({
              date: sql<string>`${sql.raw(dateFormat)}`,
              count: count(),
            })
            .from(inquiries)
            .groupBy(sql.raw(dateFormat))
            .orderBy(sql.raw(dateFormat));
    const timeSeriesData = await timeSeriesQuery;

    return NextResponse.json({
      success: true,
      data: {
        totalCount,
        byType: byType.map((item) => ({
          type: item.type,
          count: item.count,
        })),
        byStatus: byStatus.map((item) => ({
          status: item.status,
          count: item.count,
        })),
        timeSeriesData: timeSeriesData.map((item) => ({
          date: item.date,
          count: item.count,
        })),
      },
    });
  } catch (error) {
    console.error('Inquiry analytics API error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
