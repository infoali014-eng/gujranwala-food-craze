'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { Steam } from '@/components/ui/Steam';
import { Logo } from '@/components/ui/Logo';
import {
  Sparkles,
  UtensilsCrossed,
  Gift,
  Flame,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export default function DesignSystemPage() {
  const [btnLoading, setBtnLoading] = useState(false);
  const [steamStrands, setSteamStrands] = useState(3);

  const colors = [
    {
      name: 'Craze Red',
      token: 'craze-red',
      hex: '#C30D1A',
      usage: 'Primary brand identity, hero background, key badges',
      textColor: 'text-craze-cream',
      bgClass: 'bg-craze-red',
    },
    {
      name: 'Crimson Dark',
      token: 'craze-red-dark',
      hex: '#8F0A13',
      usage: 'Card borders, button shadows, deep gradients',
      textColor: 'text-craze-cream',
      bgClass: 'bg-craze-red-dark',
    },
    {
      name: 'Craze Amber',
      token: 'craze-amber',
      hex: '#FDBC5A',
      usage: 'Primary action CTAs, borders, highlights & stars',
      textColor: 'text-craze-dark',
      bgClass: 'bg-craze-amber',
    },
    {
      name: 'Craze Cream',
      token: 'craze-cream',
      hex: '#FDEFDA',
      usage: 'Primary page background, light cards, clean contrast',
      textColor: 'text-craze-dark',
      bgClass: 'bg-craze-cream border-2 border-craze-amber/50',
    },
    {
      name: 'Craze Dark',
      token: 'craze-dark',
      hex: '#2B0A0C',
      usage: 'Deep text, high-contrast headings, icons',
      textColor: 'text-craze-cream',
      bgClass: 'bg-craze-dark',
    },
  ];

  return (
    <div className="min-h-screen bg-craze-cream text-craze-dark selection:bg-craze-amber selection:text-craze-dark pb-24">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-50 bg-craze-red border-b-2 border-craze-amber text-craze-cream px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Logo size="sm" showSteam={false} />
          <div>
            <h1 className="font-heading text-2xl uppercase tracking-wider text-craze-amber leading-none">
              Gujranwala Food Craze
            </h1>
            <p className="font-serif italic text-xs text-craze-cream/80">
              Phase 1: Design System & Tokens
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="text-xs font-sans font-bold bg-craze-amber text-craze-dark px-3 py-1.5 rounded-lg shadow-[0_2px_0_0_#b88225] hover:bg-[#ffc66e] active:translate-y-0.5"
        >
          Home Page
        </Link>
      </header>

      {/* SECTION 1: Brand Logo & Animated Steam */}
      <Section
        bg="red"
        badge="Brand Identity"
        title="Logo & Animated Steam"
        subtitle="Emblem-only circular design with rising steam and flame energy. No text beneath the logo as requested."
      >
        <div className="flex flex-col items-center">
          <div className="p-8 rounded-3xl bg-craze-cream/10 border-2 border-craze-amber/30 backdrop-blur-sm shadow-xl flex flex-col items-center mb-8">
            <Logo size="xl" showSteam={true} />
            <span className="mt-4 text-xs font-mono text-craze-cream/70 bg-black/20 px-3 py-1 rounded-full">
              Hover to test subtle scale & tilt animation
            </span>
          </div>

          {/* Size matrix */}
          <div className="w-full max-w-2xl bg-craze-cream/5 border border-craze-amber/20 rounded-2xl p-6">
            <h4 className="font-heading text-xl text-craze-amber uppercase tracking-wider text-center mb-6">
              Logo Size Variants
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-end justify-items-center">
              <div className="flex flex-col items-center gap-2">
                <Logo size="sm" />
                <span className="text-xs font-mono text-craze-cream/70">Small (64px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Logo size="md" />
                <span className="text-xs font-mono text-craze-cream/70">Medium (112px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Logo size="lg" />
                <span className="text-xs font-mono text-craze-cream/70">Large (160px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Logo size="xl" />
                <span className="text-xs font-mono text-craze-cream/70">X-Large (220px)</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 2: Color Palette Swatches */}
      <Section
        bg="cream"
        badge="Palette"
        title="Brand Color Tokens"
        subtitle="Carefully balanced for maximum appetizing warmth, high mobile contrast, and Punjabi dhaba vibrancy."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {colors.map((c) => (
            <div
              key={c.name}
              className="rounded-2xl overflow-hidden shadow-sm border border-craze-dark/10 bg-white flex flex-col"
            >
              <div
                className={`h-24 ${c.bgClass} flex items-center justify-center p-3 text-center`}
              >
                <span className={`font-heading text-xl uppercase tracking-wider ${c.textColor}`}>
                  {c.name}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-craze-dark">{c.hex}</span>
                    <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {c.token}
                    </span>
                  </div>
                  <p className="text-xs text-craze-dark/75 mt-2 leading-relaxed">{c.usage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 3: Typography Hierarchy */}
      <Section
        bg="cream"
        badge="Typography"
        title="Font Hierarchy"
        subtitle="Bebas Neue for punchy condensed headlines, Lora for traditional warmth, and Inter for crisp mobile readability."
      >
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Heading */}
          <Card variant="surface" padding="lg">
            <span className="text-xs font-mono uppercase tracking-widest text-craze-red font-bold block mb-2">
              Headings: Bebas Neue (Condensed, Uppercase)
            </span>
            <h1 className="font-heading text-5xl sm:text-6xl text-craze-red uppercase tracking-wide leading-none">
              Gujranwala Food Craze
            </h1>
            <h2 className="font-heading text-3xl sm:text-4xl text-craze-dark uppercase tracking-wide mt-2">
              New deals every week, seedha aapke WhatsApp par
            </h2>
          </Card>

          {/* Serif Accent */}
          <Card variant="surface" padding="lg">
            <span className="text-xs font-mono uppercase tracking-widest text-craze-red font-bold block mb-2">
              Taglines and Accents: Lora (Serif)
            </span>
            <p className="font-serif italic text-2xl text-craze-red mb-2">
              &quot;The taste of Punjab: Asal zaiqa jo dil ko chu jaye.&quot;
            </p>
            <p className="font-serif text-base text-craze-dark/85">
              Hamare pyare customers ke dil ki baat aur asli reviews direct from Gujranwala.
            </p>
          </Card>

          {/* Sans Body */}
          <Card variant="surface" padding="lg">
            <span className="text-xs font-mono uppercase tracking-widest text-craze-red font-bold block mb-2">
              Body and Controls: Inter (Clean Sans)
            </span>
            <p className="font-sans text-sm sm:text-base text-craze-dark leading-relaxed">
              Customers scan a QR code on delivery boxes/flyers and land on this site.
              Optimized for fast mobile loading, high readability, and effortless navigation.
            </p>
            <p className="font-sans font-semibold text-xs text-craze-red-dark mt-3">
              Free hai. Jab chahein leave karein. • 312+ Food Lovers Joined
            </p>
          </Card>
        </div>
      </Section>

      {/* SECTION 4: Reusable Chunky Buttons */}
      <Section
        bg="cream"
        badge="Buttons"
        title="Chunky Tactile Buttons"
        subtitle="Dhaba-styled physical 3D button press feel with active depth and clear state indicators."
      >
        <div className="space-y-8 max-w-3xl mx-auto">
          {/* Variants */}
          <div>
            <h3 className="font-heading text-2xl uppercase tracking-wider text-craze-red mb-4">
              1. Button Variants
            </h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary">Primary (Amber CTA)</Button>
              <Button variant="secondary">Secondary (Red)</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 className="font-heading text-2xl uppercase tracking-wider text-craze-red mb-4">
              2. Button Sizes
            </h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="sm" variant="primary">Small (38px)</Button>
              <Button size="md" variant="primary">Medium (48px)</Button>
              <Button size="lg" variant="primary">Large Hero CTA (56px)</Button>
            </div>
          </div>

          {/* Icons and States */}
          <div>
            <h3 className="font-heading text-2xl uppercase tracking-wider text-craze-red mb-4">
              3. Icons & Interactive States
            </h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Button
                variant="primary"
                leftIcon={<Flame className="w-5 h-5 text-craze-red fill-craze-red" />}
              >
                Join WhatsApp Group
              </Button>

              <Button
                variant="secondary"
                leftIcon={<Share2 className="w-4 h-4" />}
              >
                Share My Note
              </Button>

              <Button
                variant="primary"
                isLoading={btnLoading}
                onClick={() => {
                  setBtnLoading(true);
                  setTimeout(() => setBtnLoading(false), 2000);
                }}
              >
                {btnLoading ? 'Loading...' : 'Click to test spinner'}
              </Button>

              <Button variant="primary" disabled>
                Disabled Button
              </Button>
            </div>
          </div>

          {/* Mobile Full-Width preview */}
          <div>
            <h3 className="font-heading text-2xl uppercase tracking-wider text-craze-red mb-4">
              4. Mobile Full-Width WhatsApp CTA Preview
            </h3>
            <div className="max-w-md mx-auto p-4 bg-craze-red rounded-2xl shadow-lg border-2 border-craze-amber/40 text-center">
              <span className="text-xs font-sans text-craze-cream/80 block mb-3">
                Over 312 foodies already joined!
              </span>
              <Button
                variant="primary"
                size="lg"
                fullWidth
              >
                Join the WhatsApp Group
              </Button>
              <span className="text-xs font-serif italic text-craze-cream/70 block mt-2">
                Free hai. Jab chahein leave karein.
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 5: Reusable Cards */}
      <Section
        bg="cream"
        badge="Cards"
        title="Card Styles & Textures"
        subtitle="Warm borders, rounded corners, and authentic Punjabi dhaba vibes."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Cream Card (Why Join) */}
          <Card variant="cream" interactive padding="lg">
            <div className="w-12 h-12 rounded-xl bg-craze-amber/30 border border-craze-amber flex items-center justify-center text-craze-dark mb-4">
              <Sparkles className="w-6 h-6 text-craze-red" />
            </div>
            <h4 className="font-heading text-2xl uppercase tracking-wider text-craze-red mb-1">
              Har Hafte Naye Deals
            </h4>
            <p className="text-sm text-craze-dark/80 leading-relaxed">
              Special weekend discounts aur exclusive combos jo sirf group members ko miltay hain.
            </p>
          </Card>

          {/* Amber Card (Exclusive) */}
          <Card variant="amber" interactive padding="lg">
            <div className="w-12 h-12 rounded-xl bg-craze-dark/10 border border-craze-dark/20 flex items-center justify-center text-craze-dark mb-4">
              <Gift className="w-6 h-6 text-craze-red" />
            </div>
            <h4 className="font-heading text-2xl uppercase tracking-wider text-craze-dark mb-1">
              VIP Members Only
            </h4>
            <p className="text-sm text-craze-dark/85 leading-relaxed">
              Surprise flash sales aur free delivery promos seedha aapke WhatsApp inbox mein.
            </p>
          </Card>

          {/* Red Card */}
          <Card variant="red" interactive padding="lg">
            <div className="w-12 h-12 rounded-xl bg-craze-amber/20 border border-craze-amber/40 flex items-center justify-center text-craze-amber mb-4">
              <UtensilsCrossed className="w-6 h-6 text-craze-amber" />
            </div>
            <h4 className="font-heading text-2xl uppercase tracking-wider text-craze-amber mb-1">
              Naye Dishes Pehle
            </h4>
            <p className="text-sm text-craze-cream/85 leading-relaxed">
              Menu mein koi nayi item aaye to sab se pehle chakhne ka shahi mauqa sirf aapka.
            </p>
          </Card>
        </div>

        {/* Sticky Note Preview Card */}
        <div className="mt-8 max-w-md mx-auto">
          <Card variant="cork" padding="lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-[#8F0A13]" />
              <h4 className="font-heading text-2xl uppercase tracking-wider text-[#2B0A0C]">
                Corkboard Texture Preview
              </h4>
            </div>
            <p className="text-sm text-[#2B0A0C]/90 font-serif italic leading-relaxed">
              This textured surface is prepared for Phase 4 Craze Wall sticky notes, complete with
              shadows and realistic pin effects.
            </p>
          </Card>
        </div>
      </Section>

      {/* SECTION 6: Standalone Steam Controls */}
      <Section
        bg="dark"
        badge="Steam FX"
        title="Dynamic Steam Controller"
        subtitle="Tune the rising steam density for maximum appetizing steam realism."
      >
        <div className="flex flex-col items-center max-w-md mx-auto">
          <div className="h-32 w-full flex items-end justify-center mb-6 bg-black/30 rounded-2xl border border-craze-amber/30 p-4 relative overflow-hidden">
            <Steam strands={steamStrands} color="#FDBC5A" />
            <span className="absolute bottom-2 text-xs font-mono text-craze-amber/60">
              Vapor generator: {steamStrands} strands
            </span>
          </div>

          <div className="flex gap-2">
            {[2, 3, 5].map((count) => (
              <button
                key={count}
                onClick={() => setSteamStrands(count)}
                className={`px-4 py-2 rounded-xl font-heading uppercase text-sm tracking-wider transition-all ${
                  steamStrands === count
                    ? 'bg-craze-amber text-craze-dark shadow-[0_2px_0_0_#b88225]'
                    : 'bg-white/10 text-craze-cream hover:bg-white/20'
                }`}
              >
                {count} Wisps
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Footer Navigation */}
      <footer className="text-center mt-16 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-craze-red font-heading text-xl uppercase tracking-wider hover:underline"
        >
          Return to Home Page
        </Link>
      </footer>
    </div>
  );
}
