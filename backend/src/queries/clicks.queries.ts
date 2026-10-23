import { getSupabase } from '../config/supabaseClient';

export interface CtaClickRecord {
  id: string;
  source: string;
  button: string;
  created_at: string;
}

// In-memory fallback
const inMemoryClicks: CtaClickRecord[] = [];

export async function logCtaClick(data: {
  source?: string;
  button: string;
}): Promise<CtaClickRecord> {
  const supabase = getSupabase();
  const source = data.source || 'direct';

  if (supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from('cta_clicks')
        .insert({
          source,
          button: data.button,
        })
        .select('*')
        .single();

      if (!error && inserted) {
        return inserted as CtaClickRecord;
      }
      if (error) {
        console.error(`[Database error logging CTA click]: ${error.message}`);
      }
    } catch (err) {
      console.error('[Exception logging CTA click]:', err);
    }
  }

  const record: CtaClickRecord = {
    id: `click-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    source,
    button: data.button,
    created_at: new Date().toISOString(),
  };

  inMemoryClicks.push(record);
  return record;
}

export async function getCtaClickStats(): Promise<{ total: number; bySource: Record<string, number> }> {
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase.from('cta_clicks').select('source');
    if (error) throw new Error(error.message);

    const bySource: Record<string, number> = {};
    (data || []).forEach((row) => {
      bySource[row.source] = (bySource[row.source] || 0) + 1;
    });

    return { total: data?.length || 0, bySource };
  }

  const bySource: Record<string, number> = {};
  inMemoryClicks.forEach((row) => {
    bySource[row.source] = (bySource[row.source] || 0) + 1;
  });

  return { total: inMemoryClicks.length, bySource };
}
