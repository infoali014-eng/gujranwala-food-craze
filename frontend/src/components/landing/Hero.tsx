'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Flame, Moon, Sun, Globe, ShieldCheck } from 'lucide-react';
import { COPY, Language } from '@/lib/copy';
import { trackClick } from '@/lib/tracking';
import { fireBrandConfetti } from '@/components/ui/Confetti';
import { useSiteLinks } from '@/context/SiteLinksContext';

interface HeroProps {
  memberCount?: number;
}

export const Hero: React.FC<HeroProps> = ({ memberCount = 312 }) => {
  const [isNightMode, setIsNightMode] = useState(false);
  const [lang, setLang] = useState<Language>('roman');
  const shouldReduceMotion = useReducedMotion();

  const { whatsapp_link } = useSiteLinks();
  const whatsappUrl =
    whatsapp_link || process.env.NEXT_PUBLIC_WHATSAPP_LINK || 'https://chat.whatsapp.com/sample-gfc-invite';

  // Automatically detect if local time is 6 PM (18:00) or later, or before 5 AM
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 5) {
      setIsNightMode(true);
    }
  }, []);

  const handleCtaClick = () => {
    fireBrandConfetti();
    trackClick('hero_whatsapp_join');
  };

  const isUrdu = lang === 'urdu';

  return (
    <section
      className={`relative text-craze-cream pt-8 pb-16 sm:pt-14 sm:pb-24 px-4 sm:px-6 overflow-hidden text-center transition-colors duration-700 ${
        isNightMode
          ? 'bg-gradient-to-b from-[#190406] via-[#48080f] to-craze-red-dark'
          : 'bg-gradient-to-b from-craze-red via-craze-red to-craze-red-dark'
      }`}
    >
      {/* Top Utility Bar: Night Mode Indicator & Language Switcher */}
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 mb-6">
        {/* Night / Day Atmospheric Toggle */}
        <button
          type="button"
          onClick={() => setIsNightMode(!isNightMode)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 hover:bg-black/50 border border-craze-amber/30 text-xs font-sans text-craze-cream/90 transition-all select-none"
          title={isNightMode ? 'Switch to Day Mode' : 'Switch to Night Dhaba Mode'}
        >
          {isNightMode ? (
            <>
              <Moon className="w-3.5 h-3.5 text-craze-amber" />
              <span className="hidden xs:inline">Night Dhaba Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-craze-amber" />
              <span className="hidden xs:inline">Day Mode</span>
            </>
          )}
        </button>

        {/* Language Toggle */}
        <button
          type="button"
          onClick={() => setLang(isUrdu ? 'roman' : 'urdu')}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-craze-amber text-craze-dark text-xs font-heading uppercase tracking-wider font-bold shadow-xs hover:bg-[#ffc66e] transition-colors select-none"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{isUrdu ? 'Roman Urdu' : 'اردو'}</span>
        </button>
      </div>

      {/* Decorative ambient background glows & night embers */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-craze-amber/15 rounded-full blur-3xl pointer-events-none" />
      {isNightMode && !shouldReduceMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-craze-amber rounded-full"
              style={{
                top: `${20 + (i * 12)}%`,
                left: `${15 + (i * 14)}%`,
                boxShadow: '0 0 8px #FDBC5A',
              }}
              animate={{
                opacity: [0.2, 0.9, 0.3],
                scale: [0.8, 1.4, 0.8],
                y: [0, -12, 0],
              }}
              transition={{
                duration: 2.5 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center">
        {/* Strictly Circular Logo Emblem with Steam & Flame Flicker */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 sm:mb-6"
        >
          <Logo size="lg" showSteam={true} interactive={true} priority={true} />
        </motion.div>

        {/* Brand Name Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="font-heading text-4xl sm:text-6xl md:text-7xl uppercase tracking-wider text-craze-cream drop-shadow-md leading-none"
        >
          {COPY.brand.name}
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`font-serif italic text-lg sm:text-2xl text-craze-amber drop-shadow-sm mt-1 mb-5 ${
            isUrdu ? 'font-sans font-bold' : ''
          }`}
        >
          {isUrdu ? COPY.brand.tagline_ur : COPY.brand.tagline}
        </motion.p>

        {/* Main Hook Headline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-black/30 border-2 border-craze-amber/40 rounded-2xl px-5 py-4 max-w-xl mx-auto backdrop-blur-sm shadow-xl mb-6"
        >
          {isNightMode && (
            <span className="inline-block text-[11px] font-sans font-bold uppercase tracking-wider text-craze-amber bg-black/40 px-2.5 py-0.5 rounded-full mb-2">
              {isUrdu ? COPY.hero.nightBadge_ur : COPY.hero.nightBadge}
            </span>
          )}
          <p
            className={`font-heading text-2xl sm:text-3xl md:text-4xl uppercase tracking-wide text-craze-amber leading-snug ${
              isUrdu ? 'font-sans font-bold normal-case' : ''
            }`}
          >
            “{isUrdu ? COPY.hero.headline_ur : COPY.hero.headline}”
          </p>
          <p className="font-sans text-xs sm:text-sm text-craze-cream/90 mt-2 leading-relaxed">
            {isUrdu ? COPY.hero.subheadline_ur : COPY.hero.subheadline}
          </p>
        </motion.div>

        {/* Live member teaser badge */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-craze-amber/20 border border-craze-amber/50 text-craze-amber text-xs font-sans font-bold uppercase tracking-wider mb-6"
        >
          <Flame className="w-4 h-4 fill-craze-amber text-craze-amber animate-pulse" />
          <span>
            Over {memberCount}+ {isUrdu ? COPY.hero.memberCountSuffix_ur : COPY.hero.memberCountSuffix}
          </span>
        </motion.div>

        {/* Big Amber WhatsApp CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-md px-2"
        >
          <Button
            href={whatsappUrl}
            external
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleCtaClick}
            leftIcon={<MessageCircle className="w-6 h-6 fill-craze-dark text-craze-amber" />}
            className="text-xl sm:text-2xl py-4 sm:py-5 rounded-2xl shadow-[0_6px_0_0_#b88225] hover:shadow-[0_4px_0_0_#a7741d]"
          >
            {isUrdu ? COPY.hero.cta_ur : COPY.hero.cta}
          </Button>

          {/* Reassurance line */}
          <p className="font-serif italic text-xs sm:text-sm text-craze-cream/80 mt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-craze-amber" />
            <span>{isUrdu ? COPY.hero.reassurance_ur : COPY.hero.reassurance}</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};
