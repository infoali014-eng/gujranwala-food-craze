import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV, validateEnv } from './env';

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return validateEnv().valid;
}

export function getSupabase(): SupabaseClient | null {
  const envValidation = validateEnv();
  if (!envValidation.valid) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(
      ENV.SUPABASE_URL,
      ENV.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  return supabaseInstance;
}

export default getSupabase;
