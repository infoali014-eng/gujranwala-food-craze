import { getSupabase } from '../config/supabaseClient';

export interface ReviewRecord {
  id: string;
  name: string;
  rating: number;
  message: string;
  note_color: 'cream' | 'amber' | 'red';
  source?: string | null;
  created_at: string;
  deleted_at?: string | null;
}

// In-memory fallback dataset for seamless local testing
const inMemoryReviews: ReviewRecord[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'Bilal Butt',
    rating: 5,
    message: 'Bhai karahi ka zaiqa kamaal tha! Makhan aur desi mirch ka balance zabardast. WhatsApp group se order kiya tha.',
    note_color: 'amber',
    source: 'qr',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    deleted_at: null,
  },
  {
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    name: 'Ayesha Tariq',
    rating: 5,
    message: 'Best Chicken Makhni Handi in Gujranwala! Garam garam delivery thi and naan bohot soft thay. Recommended!',
    note_color: 'cream',
    source: 'flyer',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    deleted_at: null,
  },
  {
    id: 'b81966a0-e2b2-4d92-bb88-34823485d949',
    name: 'Hamza Gujjar',
    rating: 5,
    message: 'Zabardast taste aur quantity bhi bohat achi thi. Pehle bite se hi pata chal gaya ke ingredients fresh hain.',
    note_color: 'red',
    source: 'direct',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    deleted_at: null,
  },
  {
    id: '3c8e6679-7425-40de-944b-e07fc1f90bb2',
    name: 'Usman Sheikh',
    rating: 4,
    message: 'Tikka boti was super juicy and smoky. Raita was fresh and packaging bohot neat thi. 10/10 zaiqa!',
    note_color: 'amber',
    source: 'packaging',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    deleted_at: null,
  },
  {
    id: '8a9e6679-7425-40de-944b-e07fc1f90cc3',
    name: 'Zainab Malik',
    rating: 5,
    message: 'WhatsApp group ka weekly deal bundle mangwaya tha. Pura paisa wasool deal thi! Definitely ordering again.',
    note_color: 'cream',
    source: 'qr',
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    deleted_at: null,
  },
  {
    id: '9b9e6679-7425-40de-944b-e07fc1f90dd4',
    name: 'Ali Raza',
    rating: 5,
    message: 'Asal Punjabi dhaba touch! Khana bilkul fresh aur steaming hot pohncha. Gujranwala mein aisi karahi bohot kam milti hai.',
    note_color: 'red',
    source: 'flyer',
    created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    deleted_at: null,
  },
];

export async function findLiveReviews(options: {
  limit?: number;
  cursor?: string;
}): Promise<{ reviews: ReviewRecord[]; nextCursor: string | null }> {
  const limit = options.limit || 20;
  const cursor = options.cursor;
  const supabase = getSupabase();

  if (supabase) {
    let query = supabase
      .from('reviews')
      .select('id, name, rating, message, note_color, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    try {
      const { data, error } = await query;
      if (!error && data) {
        const items = data as ReviewRecord[];
        const hasMore = items.length > limit;
        const reviews = hasMore ? items.slice(0, limit) : items;
        const nextCursor = hasMore ? reviews[reviews.length - 1].created_at : null;
        return { reviews, nextCursor };
      }
      if (error) {
        console.error(`[Database error fetching reviews]: ${error.message}`);
      }
    } catch (err) {
      console.error('[Exception fetching reviews]:', err);
    }
  }

  // Fallback to in-memory store
  let filtered = inMemoryReviews.filter((r) => r.deleted_at === null);
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (cursor) {
    const cursorTime = new Date(cursor).getTime();
    filtered = filtered.filter((r) => new Date(r.created_at).getTime() < cursorTime);
  }

  const hasMore = filtered.length > limit;
  const reviews = hasMore ? filtered.slice(0, limit) : filtered;
  const nextCursor = hasMore ? reviews[reviews.length - 1].created_at : null;

  return { reviews, nextCursor };
}

export async function insertReview(data: {
  name: string;
  rating: number;
  message: string;
  note_color: 'cream' | 'amber' | 'red';
  source?: string;
}): Promise<ReviewRecord> {
  const supabase = getSupabase();

  if (supabase) {
    const { data: inserted, error } = await supabase
      .from('reviews')
      .insert({
        name: data.name,
        rating: data.rating,
        message: data.message,
        note_color: data.note_color,
        source: data.source || 'direct',
      })
      .select('id, name, rating, message, note_color, created_at')
      .single();

    if (error) {
      throw new Error(`Database error creating review: ${error.message}`);
    }

    return inserted as ReviewRecord;
  }

  // In-memory fallback
  const newReview: ReviewRecord = {
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: data.name,
    rating: data.rating,
    message: data.message,
    note_color: data.note_color,
    source: data.source || 'direct',
    created_at: new Date().toISOString(),
    deleted_at: null,
  };

  inMemoryReviews.unshift(newReview);
  return newReview;
}

export async function findAllReviews(includeDeleted = false): Promise<ReviewRecord[]> {
  const supabase = getSupabase();

  if (supabase) {
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []) as ReviewRecord[];
  }

  return inMemoryReviews.filter((r) => (includeDeleted ? true : r.deleted_at === null));
}

export async function softDeleteReview(id: string): Promise<boolean> {
  const supabase = getSupabase();

  if (supabase) {
    const { error } = await supabase
      .from('reviews')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  const review = inMemoryReviews.find((r) => r.id === id);
  if (review) {
    review.deleted_at = new Date().toISOString();
    return true;
  }
  return false;
}

export async function restoreReview(id: string): Promise<boolean> {
  const supabase = getSupabase();

  if (supabase) {
    const { error } = await supabase.from('reviews').update({ deleted_at: null }).eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  const review = inMemoryReviews.find((r) => r.id === id);
  if (review) {
    review.deleted_at = null;
    return true;
  }
  return false;
}
