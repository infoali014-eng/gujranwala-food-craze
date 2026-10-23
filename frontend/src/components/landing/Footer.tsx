'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Heart } from 'lucide-react';
import { COPY } from '@/lib/copy';
import { trackClick } from '@/lib/tracking';
import { fireBrandConfetti } from '@/components/ui/Confetti';

export const Footer: React.FC = () => {
  const whatsappUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_LINK || 'https://chat.whatsapp.com/sample-gfc-invite';

  const handleCtaClick = () => {
    fireBrandConfetti();
    trackClick('footer_whatsapp_join');
  };

  return (
    <footer
      className="bg-craze-dark text-craze-cream border-t-4 border-craze-amber pt-12 px-4 sm:px-6 relative overflow-hidden"
      style={{
        paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Logo Emblem (Strictly no text underneath) */}
        <div className="mb-4">
          <Logo size="md" showSteam={false} />
        </div>

        <h3 className="font-heading text-3xl sm:text-4xl uppercase tracking-wider text-craze-amber">
          {COPY.brand.name}
        </h3>
        <p className="font-serif italic text-base sm:text-lg text-craze-cream/80 mt-1 mb-6">
          {COPY.brand.tagline}
        </p>

        {/* Final CTA Card */}
        <div className="w-full max-w-md bg-white/5 border border-craze-amber/30 rounded-2xl p-6 backdrop-blur-sm mb-8">
          <p className="font-heading text-2xl uppercase tracking-wide text-craze-cream mb-2">
            Stay Connected with the Taste of Punjab
          </p>
          <p className="text-xs sm:text-sm text-craze-cream/70 mb-4 font-sans">
            Har hafte VIP deals aur discount vouchers direct aapke mobile par.
          </p>
          <Button
            href={whatsappUrl}
            external
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleCtaClick}
            leftIcon={<MessageCircle className="w-5 h-5 fill-craze-dark text-craze-amber" />}
            className="shadow-chunky-amber min-h-[56px]"
          >
            {COPY.hero.cta}
          </Button>
          <span className="block mt-2 text-[11px] font-serif italic text-craze-cream/60">
            {COPY.hero.reassurance}
          </span>
        </div>

        {/* Social Links Placeholders (min 48px touch targets) */}
        <div className="flex items-center gap-4 mb-6">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-[#25D366] text-white flex items-center justify-center transition-colors min-w-[48px] min-h-[48px]"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-[#1877F2] text-white flex items-center justify-center transition-colors font-bold text-sm min-w-[48px] min-h-[48px]"
            aria-label="Facebook"
          >
            f
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-[#E4405F] text-white flex items-center justify-center transition-colors font-bold text-sm min-w-[48px] min-h-[48px]"
            aria-label="Instagram"
          >
            IG
          </a>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-sans text-craze-cream/70 mb-8">
          <Link href="/" className="hover:text-craze-amber transition-colors min-h-[48px] inline-flex items-center">
            Home
          </Link>
          <Link href="/craze-wall" className="hover:text-craze-amber transition-colors min-h-[48px] inline-flex items-center">
            Craze Wall
          </Link>
          <Link href="/design" className="hover:text-craze-amber transition-colors min-h-[48px] inline-flex items-center">
            Design System
          </Link>
          <Link href="/admin/login" className="hover:text-craze-amber transition-colors min-h-[48px] inline-flex items-center">
            Admin Moderation
          </Link>
        </div>

        {/* Bottom Tagline & Copyright */}
        <div className="pt-6 border-t border-white/10 w-full text-xs text-craze-cream/60 font-sans flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{COPY.footer.copyright}</span>
          <span className="flex items-center gap-1">
            <span>{COPY.footer.madeWith}</span>
            <Heart className="w-3.5 h-3.5 fill-craze-red text-craze-red inline" />
            <span>in Gujranwala</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
