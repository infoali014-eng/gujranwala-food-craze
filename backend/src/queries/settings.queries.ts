import { getSupabase } from '../config/supabaseClient';

export const HARDCODED_WHATSAPP_LINK =
  'https://chat.whatsapp.com/B9mYGX1vmzx4OQQjUliwzQ?s=cl&p=a&mlu=4&ilr=4';

export interface SiteSettings {
  id: number;
  whatsapp_link: string;
  foodpanda_link: string;
  updated_at: string;
}

function resolveWhatsApp(link?: string | null): string {
  if (
    link &&
    typeof link === 'string' &&
    link.trim().length > 0 &&
    !link.includes('sample-gfc-invite') &&
    !link.includes('your-group-invite')
  ) {
    return link.trim();
  }
  return HARDCODED_WHATSAPP_LINK;
}

let inMemorySettings: SiteSettings = {
  id: 1,
  whatsapp_link: resolveWhatsApp(process.env.NEXT_PUBLIC_WHATSAPP_LINK),
  foodpanda_link: process.env.NEXT_PUBLIC_FOODPANDA_LINK || 'https://www.foodpanda.pk',
  updated_at: new Date().toISOString(),
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (!error && data) {
        inMemorySettings = {
          ...data,
          whatsapp_link: resolveWhatsApp(data.whatsapp_link),
        } as SiteSettings;
        return inMemorySettings;
      }
    } catch {
      // Return in-memory fallback
    }
  }

  return inMemorySettings;
}

export async function updateSiteSettings(
  whatsapp_link: string,
  foodpanda_link: string
): Promise<SiteSettings> {
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        id: 1,
        whatsapp_link,
        foodpanda_link,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      inMemorySettings = data as SiteSettings;
      return inMemorySettings;
    }
  }

  // Update in-memory fallback
  inMemorySettings = {
    id: 1,
    whatsapp_link,
    foodpanda_link,
    updated_at: new Date().toISOString(),
  };

  return inMemorySettings;
}
