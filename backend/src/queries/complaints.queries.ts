import { getSupabase } from '../config/supabaseClient';

export type ComplaintType = 'complaint' | 'suggestion' | 'other';
export type ComplaintStatus = 'new' | 'in_progress' | 'resolved';

export interface ComplaintRecord {
  id: string;
  reference_number: string;
  type: ComplaintType;
  name: string;
  phone: string;
  order_details?: string | null;
  message: string;
  source?: string | null;
  status: ComplaintStatus;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

const inMemoryComplaints: ComplaintRecord[] = [
  {
    id: 'c1983058-2950-48e7-b673-9a3b680b5901',
    reference_number: 'GFC-C-4921',
    type: 'complaint',
    name: 'Muhammad Usman',
    phone: '0301 7654321',
    order_details: 'Order #418 - Chicken Karahi',
    message:
      'Kal raat delivery mein raita missing tha aur naan thande thay. Taste acha tha magar service theek karein.',
    source: 'qr',
    status: 'new',
    admin_notes: null,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    deleted_at: null,
  },
  {
    id: 'c2983058-2950-48e7-b673-9a3b680b5902',
    reference_number: 'GFC-S-8193',
    type: 'suggestion',
    name: 'Hamza Cheema',
    phone: '0322 9876543',
    order_details: null,
    message:
      'Menu mein Mutton Champ aur Garlic Naan bhi add karein, Gujranwala mein bohot demand hai iski.',
    source: 'packaging',
    status: 'in_progress',
    admin_notes:
      'Kitchen team se baat ki hai, agle menu update mein include karne ka sochenge.',
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    deleted_at: null,
  },
];

export async function insertComplaint(data: {
  reference_number: string;
  type: ComplaintType;
  name: string;
  phone: string;
  order_details?: string | null;
  message: string;
  source?: string | null;
}): Promise<ComplaintRecord> {
  const newRecord: ComplaintRecord = {
    id: `cmp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    reference_number: data.reference_number,
    type: data.type,
    name: data.name,
    phone: data.phone,
    order_details: data.order_details || null,
    message: data.message,
    source: data.source || 'direct',
    status: 'new',
    admin_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  };

  const supabase = getSupabase();
  if (supabase && !process.env.SUPABASE_URL?.includes('dummy')) {
    try {
      const { data: inserted, error } = await supabase
        .from('complaints')
        .insert({
          reference_number: newRecord.reference_number,
          type: newRecord.type,
          name: newRecord.name,
          phone: newRecord.phone,
          order_details: newRecord.order_details,
          message: newRecord.message,
          source: newRecord.source,
          status: newRecord.status,
          admin_notes: null,
          created_at: newRecord.created_at,
          updated_at: newRecord.updated_at,
        })
        .select('*')
        .single();

      if (!error && inserted) {
        inMemoryComplaints.unshift(inserted as ComplaintRecord);
        return inserted as ComplaintRecord;
      }

      if (error) {
        console.error(`[Supabase insertComplaint Error]: ${error.message}`);
        // If select failed because of permissions, try plain insert
        const { error: plainInsertErr } = await supabase.from('complaints').insert({
          reference_number: newRecord.reference_number,
          type: newRecord.type,
          name: newRecord.name,
          phone: newRecord.phone,
          order_details: newRecord.order_details,
          message: newRecord.message,
          source: newRecord.source,
          status: newRecord.status,
          admin_notes: null,
          created_at: newRecord.created_at,
          updated_at: newRecord.updated_at,
        });

        if (!plainInsertErr) {
          inMemoryComplaints.unshift(newRecord);
          return newRecord;
        }
      }
    } catch (err) {
      console.error('[Supabase insertComplaint Exception]:', err);
    }
  }

  inMemoryComplaints.unshift(newRecord);
  return newRecord;
}

export async function findAllComplaints(includeDeleted = false): Promise<ComplaintRecord[]> {
  const supabase = getSupabase();

  if (supabase && !process.env.SUPABASE_URL?.includes('dummy')) {
    try {
      let query = supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeDeleted) {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as ComplaintRecord[];
      }
      if (error) {
        console.error(`[Supabase findAllComplaints Error]: ${error.message}`);
      }
    } catch (err) {
      console.error('[Supabase findAllComplaints Exception]:', err);
    }
  }

  return inMemoryComplaints.filter((c) => (includeDeleted ? true : c.deleted_at === null));
}

export async function updateComplaintStatus(
  id: string,
  status: ComplaintStatus
): Promise<ComplaintRecord | null> {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  if (supabase && !id.startsWith('cmp-') && !process.env.SUPABASE_URL?.includes('dummy')) {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .update({ status, updated_at: now })
        .eq('id', id)
        .select('*')
        .single();

      if (!error && data) {
        const idx = inMemoryComplaints.findIndex((c) => c.id === id);
        if (idx !== -1) inMemoryComplaints[idx] = data as ComplaintRecord;
        return data as ComplaintRecord;
      }
    } catch (err) {
      console.error('[Supabase updateComplaintStatus Exception]:', err);
    }
  }

  const item = inMemoryComplaints.find((c) => c.id === id);
  if (item) {
    item.status = status;
    item.updated_at = now;
    return item;
  }
  return null;
}

export async function updateComplaintNotes(
  id: string,
  admin_notes: string
): Promise<ComplaintRecord | null> {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  if (supabase && !id.startsWith('cmp-') && !process.env.SUPABASE_URL?.includes('dummy')) {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .update({ admin_notes, updated_at: now })
        .eq('id', id)
        .select('*')
        .single();

      if (!error && data) {
        const idx = inMemoryComplaints.findIndex((c) => c.id === id);
        if (idx !== -1) inMemoryComplaints[idx] = data as ComplaintRecord;
        return data as ComplaintRecord;
      }
    } catch (err) {
      console.error('[Supabase updateComplaintNotes Exception]:', err);
    }
  }

  const item = inMemoryComplaints.find((c) => c.id === id);
  if (item) {
    item.admin_notes = admin_notes;
    item.updated_at = now;
    return item;
  }
  return null;
}

export async function softDeleteComplaint(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  if (supabase && !id.startsWith('cmp-') && !process.env.SUPABASE_URL?.includes('dummy')) {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ deleted_at: now, updated_at: now })
        .eq('id', id);

      if (!error) return true;
      console.error(`[Supabase softDeleteComplaint Error]: ${error.message}`);
    } catch (err) {
      console.error('[Supabase softDeleteComplaint Exception]:', err);
    }
  }

  const item = inMemoryComplaints.find((c) => c.id === id);
  if (item) {
    item.deleted_at = now;
    return true;
  }
  return false;
}

export async function restoreComplaint(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  if (supabase && !id.startsWith('cmp-') && !process.env.SUPABASE_URL?.includes('dummy')) {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ deleted_at: null, updated_at: now })
        .eq('id', id);

      if (!error) return true;
      console.error(`[Supabase restoreComplaint Error]: ${error.message}`);
    } catch (err) {
      console.error('[Supabase restoreComplaint Exception]:', err);
    }
  }

  const item = inMemoryComplaints.find((c) => c.id === id);
  if (item) {
    item.deleted_at = null;
    return true;
  }
  return false;
}
