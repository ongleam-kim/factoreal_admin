import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/db/supabase';
import { z } from 'zod';

// Validation schema
const signinSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = signinSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: validation.error.issues,
        },
        { status: 422 }
      );
    }

    const { email, password } = validation.data;
    const supabase = await createSupabaseServerClient();

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    // Check if user has admin role (from metadata or custom table)
    const userRole = data.user.user_metadata?.role || 'user';
    if (userRole !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: userRole,
      },
      session: data.session,
    });
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
