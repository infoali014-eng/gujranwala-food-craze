import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from './env';

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    ENV.SUPABASE_URL &&
      ENV.SUPABASE_SERVICE_ROLE_KEY &&
      !ENV.SUPABASE_URL.includes('your-project') &&
      !ENV.SUPABASE_URL.includes('dummy') &&
      ENV.SUPABASE_URL.startsWith('https://')
  );
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseInstance;
}

export default getSupabase;
