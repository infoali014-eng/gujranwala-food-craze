'use client';

import React from 'react';
import Link from 'next/link';
import { Pin, MessageCircle } from 'lucide-react';
import { COPY } from '@/lib/copy';
import { trackClickApi } from '@/lib/api';
import { useSiteLinks } from '@/context/SiteLinksContext';

export const NotFoundActions: React.FC = () => {
  const { whatsapp_link } = useSiteLinks();
  const whatsappUrl =
    whatsapp_link ||
    process.env.NEXT_PUBLIC_WHATSAPP_LINK ||
    'https://chat.whatsapp.com/sample-gfc-invite';

  const handleCrazeWallClick = () => {
    try {
      trackClickApi({
        source: 'unavailable-page',
        button: 'unavailable_craze_wall_click',
      });
    } catch {
      // Ignore tracking errors
    }
  };

  const handleWhatsAppClick = () => {
    try {
      trackClickApi({
        source: 'unavailable-page',
        button: 'unavailable_whatsapp_click',
      });
    } catch {
      // Ignore tracking errors
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-4 max-w-md mx-auto w-full">
      {/* Primary Action: Go to Craze Wall */}
      <Link
        href="/craze-wall"
        onClick={handleCrazeWallClick}
        className="w-full min-h-[48px] px-6 py-3.5 rounded-xl bg-craze-red text-white font-heading text-base sm:text-lg uppercase tracking-wider shadow-[0_4px_0_0_#8F0A13] hover:bg-craze-red-dark active:translate-y-0.5 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-craze-amber/50"
      >
        <Pin className="w-5 h-5 text-craze-amber" />
        <span>{COPY.unavailable.crazeWallButton}</span>
      </Link>

      {/* Secondary Action: Join WhatsApp Community */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsAppClick}
        className="w-full min-h-[48px] px-6 py-3.5 rounded-xl bg-craze-amber text-craze-dark font-heading text-sm sm:text-base uppercase tracking-wider shadow-[0_4px_0_0_#D99532] hover:bg-[#ffc66e] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-craze-red/30"
      >
        <MessageCircle className="w-5 h-5 text-craze-red" />
        <span className="text-center">{COPY.unavailable.whatsappButton}</span>
      </a>
    </div>
  );
};
