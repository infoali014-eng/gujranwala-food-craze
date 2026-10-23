import { getSupabase } from '../config/supabaseClient';

export interface MemberStatsRecord {
  id: number;
  joined_count: number;
  display_boost: number;
  total_display_count: number;
  updated_at: string;
}

// In-memory fallback
let inMemoryStats = {
  id: 1,
  joined_count: 312,
  display_boost: 0,
  updated_at: new Date().toISOString(),
};

export async function getMembersStats(): Promise<MemberStatsRecord> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('members_stats')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (!error && data) {
        return {
          ...data,
          total_display_count: (data.joined_count || 0) + (data.display_boost || 0),
        };
      }
      if (error) {
        console.error(`[Database error fetching member stats]: ${error.message}`);
      }
    } catch (err) {
      console.error('[Exception fetching member stats]:', err);
    }
  }

  return {
    ...inMemoryStats,
    total_display_count: inMemoryStats.joined_count + inMemoryStats.display_boost,
  };
}

export async function updateMembersStats(
  joinedCount: number,
  displayBoost?: number
): Promise<MemberStatsRecord> {
  const supabase = getSupabase();

  if (supabase && !process.env.SUPABASE_URL?.includes('dummy')) {
    try {
      const payload: { joined_count: number; display_boost?: number; updated_at: string } = {
        joined_count: joinedCount,
        updated_at: new Date().toISOString(),
      };
      if (typeof displayBoost === 'number') {
        payload.display_boost = displayBoost;
      }

      const { data, error } = await supabase
        .from('members_stats')
        .upsert({ id: 1, ...payload })
        .select('*')
        .single();

      if (!error && data) {
        return {
          ...data,
          total_display_count: data.joined_count + (data.display_boost || 0),
        };
      }
      if (error) {
        console.error(`[Supabase updateMembersStats Error]: ${error.message}`);
      }
    } catch (err) {
      console.error('[Supabase updateMembersStats Exception]:', err);
    }
  }

  inMemoryStats.joined_count = joinedCount;
  if (typeof displayBoost === 'number') {
    inMemoryStats.display_boost = displayBoost;
  }
  inMemoryStats.updated_at = new Date().toISOString();

  return {
    ...inMemoryStats,
    total_display_count: inMemoryStats.joined_count + inMemoryStats.display_boost,
  };
}
