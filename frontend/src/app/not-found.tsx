import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Pin, MessageCircle, Flame, Sparkles, ChefHat } from 'lucide-react';
import { COPY } from '@/lib/copy';
import { HARDCODED_WHATSAPP_LINK, resolveWhatsAppLink } from '@/lib/constants';
import { UnavailableTracker } from '@/components/unavailable/UnavailableTracker';

export const metadata: Metadata = {
  title: 'Page Unavailable | Gujranwala Food Craze',
  description:
    'This page is currently being prepared. Check out customer reviews on the Craze Wall or join our WhatsApp community.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFoundPage() {
  const whatsappUrl = resolveWhatsAppLink(
    process.env.NEXT_PUBLIC_WHATSAPP_LINK
  );

  return (
    <>
      <head>
        <title>Page Unavailable | Gujranwala Food Craze</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>

      {/* Client-side tracking component for button clicks */}
      <UnavailableTracker />

      <div className="min-h-screen bg-[#FDEFDA] text-craze-dark flex flex-col justify-between selection:bg-craze-amber selection:text-craze-dark relative overflow-x-hidden">
        {/* Subtle Dhaba / Phulkari Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#8F0A13 1.5px, transparent 1.5px), radial-gradient(#FDBC5A 1.5px, transparent 1.5px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        {/* Top Slim Brand Header */}
        <header className="w-full bg-[#8F0A13] text-craze-cream py-3 px-4 shadow-sm border-b-2 border-craze-amber/50 relative z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="font-heading uppercase text-base sm:text-lg tracking-wider text-craze-amber">
              {COPY.brand.name}
            </span>
            <span className="font-serif italic text-xs sm:text-sm text-craze-cream/90">
              {COPY.brand.tagline}
            </span>
          </div>
        </header>

        {/* Main Content Card Container */}
        <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col justify-center items-center relative z-10">
          <div className="w-full bg-white rounded-3xl border-4 border-craze-amber shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden">
            {/* Decorative Top Accent Stripe */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-craze-red via-craze-amber to-craze-red" />

            {/* 1. Large Themed 404 Treatment with Karahi Center */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 my-2">
              <span className="font-heading text-6xl sm:text-8xl md:text-9xl text-craze-red leading-none select-none tracking-tight">
                4
              </span>

              {/* Center Zero: Karahi with Steam and Flame */}
              <div className="relative flex items-center justify-center p-2 rounded-2xl bg-[#FDEFDA] border-2 border-craze-amber shadow-inner">
                <Logo size="md" showSteam={true} interactive={false} />
              </div>

              <span className="font-heading text-6xl sm:text-8xl md:text-9xl text-craze-red leading-none select-none tracking-tight">
                4
              </span>
            </div>

            {/* 2. Main Headline in Roman Urdu and English */}
            <div className="mt-4 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-craze-red/10 text-craze-red text-xs font-sans font-bold uppercase tracking-wider mb-2">
                <ChefHat className="w-3.5 h-3.5 text-craze-red" />
                {COPY.unavailable.badge}
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase tracking-wide text-craze-dark leading-tight">
                {COPY.unavailable.title}
              </h1>
              <p className="font-sans text-sm sm:text-base text-gray-600 mt-1">
                {COPY.unavailable.subtitle}
              </p>
            </div>

            {/* 3. Coming Soon Section with Food Simmering Theme */}
            <div className="bg-[#FDEFDA]/70 border-2 border-craze-amber/60 rounded-2xl p-4 sm:p-6 mb-8 text-center relative">
              <div className="flex items-center justify-center gap-1.5 mb-1.5 text-craze-red">
                <Flame className="w-4 h-4 text-craze-red motion-safe:animate-pulse" />
                <h2 className="font-heading text-xl sm:text-2xl uppercase tracking-wider text-craze-red">
                  {COPY.unavailable.cookingTitle}
                </h2>
                <Sparkles className="w-4 h-4 text-craze-amber" />
              </div>

              <p className="font-serif italic text-sm sm:text-base text-craze-dark font-medium leading-relaxed max-w-md mx-auto">
                {COPY.unavailable.teaser}
              </p>

              {/* Decorative Simmering Progress Bar (No date claim) */}
              <div className="mt-5 max-w-xs mx-auto">
                <div className="flex justify-between items-center text-[11px] font-sans font-bold text-craze-dark mb-1.5 px-1">
                  <span>{COPY.unavailable.progressLabel}</span>
                  <span className="text-craze-red">85%</span>
                </div>
                <div className="w-full bg-white rounded-full h-3 border border-craze-amber overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-craze-amber via-craze-red to-craze-amber h-full rounded-full transition-all duration-1000 motion-safe:animate-pulse"
                    style={{ width: '85%' }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 font-sans mt-1.5 block">
                  {COPY.unavailable.progressSubtext}
                </span>
              </div>
            </div>

            {/* 4. Action Buttons (Rendered in direct HTML for instant delivery, zero arrows) */}
            <div className="space-y-3.5 sm:space-y-4 max-w-md mx-auto w-full">
              {/* Primary Action: Go to Craze Wall */}
              <Link
                href="/craze-wall"
                data-track-click="unavailable_craze_wall_click"
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
                data-track-click="unavailable_whatsapp_click"
                className="w-full min-h-[48px] px-6 py-3.5 rounded-xl bg-craze-amber text-craze-dark font-heading text-sm sm:text-base uppercase tracking-wider shadow-[0_4px_0_0_#D99532] hover:bg-[#ffc66e] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-craze-red/30"
              >
                <MessageCircle className="w-5 h-5 text-craze-red" />
                <span className="text-center">{COPY.unavailable.whatsappButton}</span>
              </a>
            </div>
          </div>
        </main>

        {/* 5. On-Brand Footer with Tagline and Discrete Admin Login */}
        <footer className="w-full py-6 px-4 text-center border-t border-craze-amber/30 relative z-10 text-xs font-sans text-gray-600">
          <div className="max-w-md mx-auto space-y-2">
            <p className="font-serif italic text-sm text-craze-red font-medium">
              {COPY.brand.tagline}
            </p>
            <p className="text-[11px] text-gray-500">
              {new Date().getFullYear()} Gujranwala Food Craze. All rights reserved.
            </p>

            {/* Small Discrete Admin Login Link */}
            <div className="pt-2">
              <Link
                href="/admin/login"
                className="text-[11px] text-gray-400 hover:text-craze-red underline transition-colors"
              >
                {COPY.unavailable.adminLoginText}
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
