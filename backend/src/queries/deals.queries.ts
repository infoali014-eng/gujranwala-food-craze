import { getSupabase } from '../config/supabaseClient';

export interface DealRecord {
  id: string;
  title: string;
  description: string;
  price_text: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

// In-memory fallback
let inMemoryDeal: DealRecord = {
  id: 'd1983058-2950-48e7-b673-9a3b680b5932',
  title: 'Craze Special Family Karahi Feast',
  description:
    '1KG Special Chicken Karahi + 4 Roghni Naan + Fresh Mint Raita + Salad + 1.5L Chilled Drink',
  price_text: 'Rs. 1,850 (Save Rs. 450)',
  valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  is_active: true,
  created_at: new Date().toISOString(),
};

export async function findCurrentDeal(): Promise<DealRecord | null> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('is_active', true)
        .gt('valid_until', new Date().toISOString())
        .order('valid_until', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return (data as DealRecord) || null;
      }
      if (error) {
        console.error(`[Database error fetching current deal]: ${error.message}`);
      }
    } catch (err) {
      console.error('[Exception fetching current deal]:', err);
    }
  }

  // Check fallback
  if (inMemoryDeal.is_active && new Date(inMemoryDeal.valid_until) > new Date()) {
    return inMemoryDeal;
  }
  return null;
}

export async function updateWeeklyDeal(
  dealData: Partial<Omit<DealRecord, 'id' | 'created_at'>>
): Promise<DealRecord> {
  const supabase = getSupabase();

  if (supabase) {
    // If a deal exists, update it, else insert
    const current = await findCurrentDeal();
    if (current) {
      const { data, error } = await supabase
        .from('deals')
        .update(dealData)
        .eq('id', current.id)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return data as DealRecord;
    } else {
      const { data, error } = await supabase
        .from('deals')
        .insert({
          ...dealData,
          is_active: true,
        })
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return data as DealRecord;
    }
  }

  inMemoryDeal = {
    ...inMemoryDeal,
    ...dealData,
  };
  return inMemoryDeal;
}
