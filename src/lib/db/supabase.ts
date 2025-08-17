import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Browser client for client-side operations
export const createSupabaseClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Server client for server-side operations
export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(key: string) {
        return cookieStore.get(key)?.value;
      },
    },
  });
};

// Admin client with service role for admin operations
export const createSupabaseAdminClient = () => {
  if (!supabaseServiceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY environment variable is required for admin operations'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseServiceKey);
};
