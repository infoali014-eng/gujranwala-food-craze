import { getSupabase } from '../config/supabaseClient';

export interface AdminRecord {
  user_id: string;
  created_at: string;
}

// In-memory fallback
const inMemoryAdmins = new Set<string>(['admin-demo-id']);

export async function isAdminUser(userId: string): Promise<boolean> {
  if (!userId) return false;
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error verifying admin user:', error);
      return false;
    }

    return Boolean(data);
  }

  return inMemoryAdmins.has(userId);
}

export async function addAdminUser(userId: string): Promise<boolean> {
  const supabase = getSupabase();

  if (supabase) {
    const { error } = await supabase.from('admins').insert({ user_id: userId });
    if (error) throw new Error(error.message);
    return true;
  }

  inMemoryAdmins.add(userId);
  return true;
}
