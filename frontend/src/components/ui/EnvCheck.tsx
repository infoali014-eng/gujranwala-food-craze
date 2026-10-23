'use client';

import { useEffect, useRef } from 'react';

/**
 * Startup utility that warns once in the browser console if any expected
 * public environment variables are missing.
 */
export function EnvCheck() {
  const hasWarnedRef = useRef(false);

  useEffect(() => {
    if (hasWarnedRef.current) return;
    hasWarnedRef.current = true;

    const missing: string[] = [];

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      missing.push('NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    if (!process.env.NEXT_PUBLIC_WHATSAPP_LINK) {
      missing.push('NEXT_PUBLIC_WHATSAPP_LINK');
    }
    if (!process.env.NEXT_PUBLIC_FOODPANDA_LINK) {
      missing.push('NEXT_PUBLIC_FOODPANDA_LINK');
    }

    // NEXT_PUBLIC_API_URL is only strictly required if running as separate projects (Topology B)
    if (!process.env.NEXT_PUBLIC_API_URL && window.location.hostname !== 'localhost') {
      // In Topology A (Services), same-origin /api is used automatically.
      console.info(
        '[EnvCheck] NEXT_PUBLIC_API_URL is not set. Using same-origin /api (Topology A Services mode).'
      );
    }

    if (missing.length > 0) {
      console.warn(
        `[EnvCheck] Missing frontend environment variables (set these in Vercel): ${missing.join(', ')}`
      );
    }
  }, []);

  return null;
}
