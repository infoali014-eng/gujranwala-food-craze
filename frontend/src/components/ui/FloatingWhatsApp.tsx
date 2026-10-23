'use client';

import React, { useEffect, useState } from 'react';
import { trackClick } from '@/lib/tracking';
import { fireBrandConfetti } from './Confetti';

interface FloatingWhatsAppProps {
  hasPosted?: boolean;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ hasPosted = false }) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isPostedLocally, setIsPostedLocally] = useState(hasPosted);

  const whatsappUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_LINK || 'https://chat.whatsapp.com/sample-gfc-invite';

  useEffect(() => {
    // Check if user has already posted from localStorage
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('craze_posted') === 'true') {
        setIsPostedLocally(true);
      }
    } catch {
      // Storage unavailable
    }

    // Detect virtual keyboard / input focus on mobile phones
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    const handleViewportResize = () => {
      if (window.visualViewport) {
        // If visual viewport shrinks significantly, mobile keyboard is open
        const isShrunk = window.visualViewport.height < window.innerHeight * 0.75;
        setIsKeyboardOpen(isShrunk);
      }
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
    }

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      }
    };
  }, []);

  // If user already posted, or if keyboard is open / field focused, do not show floating button
  if (hasPosted || isPostedLocally || isKeyboardOpen) {
    return null;
  }

  const handleClick = () => {
    fireBrandConfetti();
    trackClick('floating_whatsapp');
  };

  return (
    <div
      className="fixed z-40 select-none transition-all duration-200"
      style={{
        bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
        right: 'calc(1rem + env(safe-area-inset-right, 0px))',
      }}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        aria-label="Join WhatsApp Group for Exclusive Deals"
        className="relative flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-[0_4px_16px_rgba(37,211,102,0.4)] hover:bg-[#20ba59] active:scale-95 transition-transform min-h-[48px]"
      >
        {/* Pulse ring animation */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-craze-amber opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-craze-amber border border-white"></span>
        </span>

        {/* WhatsApp Brand SVG */}
        <svg
          className="w-5 h-5 fill-white shrink-0"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>

        <span className="font-heading uppercase tracking-wider text-sm sm:text-base pr-1">
          Join for Exclusive Deals
        </span>
      </a>
    </div>
  );
};
