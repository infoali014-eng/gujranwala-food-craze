import React from 'react';
import type { Metadata } from 'next';
import { Hero } from '@/components/landing/Hero';
import { WhyJoin } from '@/components/landing/WhyJoin';
import { DealBanner } from '@/components/landing/DealBanner';
import { MemberCounter } from '@/components/landing/MemberCounter';
import { MenuCarousel } from '@/components/landing/MenuCarousel';
import { WallPreview } from '@/components/landing/WallPreview';
import { Footer } from '@/components/landing/Footer';
import { FloatingWhatsApp } from '@/components/ui/FloatingWhatsApp';
import { LandingTracker } from '@/components/landing/LandingTracker';
import { Deal, Review } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Gujranwala Food Craze: Join the Craze! VIP WhatsApp Community',
  description:
    'Scan me! Get weekly food deals straight to your WhatsApp. Enjoy authentic Punjabi Karahi, Handi, Kebabs, and more in Gujranwala, Pakistan.',
  openGraph: {
    title: 'Gujranwala Food Craze: The taste of Punjab',
    description: 'New deals every week, seedha aapke WhatsApp par! Join our food lover community.',
    url: 'https://gujranwalafoodcraze.com',
    siteName: 'Gujranwala Food Craze',
    images: [
      {
        url: '/logo.png',
        width: 344,
        height: 344,
        alt: 'Gujranwala Food Craze Logo',
      },
    ],
    locale: 'en_PK',
    type: 'website',
  },
};

// Fallback data for ultra-fast load & offline resilience
const fallbackDeal: Deal = {
  id: 'd1983058-2950-48e7-b673-9a3b680b5932',
  title: 'Craze Special Family Karahi Feast',
  description:
    '1KG Special Chicken Karahi + 4 Roghni Naan + Fresh Mint Raita + Salad + 1.5L Chilled Drink',
  price_text: 'Rs. 1,850 (Save Rs. 450)',
  valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  is_active: true,
  created_at: new Date().toISOString(),
};

const fallbackReviews: Review[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'Bilal Butt',
    rating: 5,
    message:
      'Bhai karahi ka zaiqa kamaal tha! Makhan aur desi mirch ka balance zabardast. WhatsApp group se order kiya tha.',
    note_color: 'amber',
    source: 'qr',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    name: 'Ayesha Tariq',
    rating: 5,
    message:
      'Best Chicken Makhni Handi in Gujranwala! Garam garam delivery thi and naan bohot soft thay. Recommended!',
    note_color: 'cream',
    source: 'flyer',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'b81966a0-e2b2-4d92-bb88-34823485d949',
    name: 'Hamza Gujjar',
    rating: 5,
    message:
      'Zabardast taste aur quantity bhi bohat achi thi. Pehle bite se hi pata chal gaya ke ingredients fresh hain.',
    note_color: 'red',
    source: 'direct',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3c8e6679-7425-40de-944b-e07fc1f90bb2',
    name: 'Usman Sheikh',
    rating: 4,
    message:
      'Tikka boti was super juicy and smoky. Raita was fresh and packaging bohot neat thi. 10/10 zaiqa!',
    note_color: 'amber',
    source: 'packaging',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8a9e6679-7425-40de-944b-e07fc1f90cc3',
    name: 'Zainab Malik',
    rating: 5,
    message:
      'WhatsApp group ka weekly deal bundle mangwaya tha. Pura paisa wasool deal thi! Definitely ordering again.',
    note_color: 'cream',
    source: 'qr',
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '9b9e6679-7425-40de-944b-e07fc1f90dd4',
    name: 'Ali Raza',
    rating: 5,
    message:
      'Asal Punjabi dhaba touch! Khana bilkul fresh aur steaming hot pohncha. Gujranwala mein aisi karahi bohot kam milti hai.',
    note_color: 'red',
    source: 'flyer',
    created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
  },
];

async function getInitialData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  try {
    const [dealRes, statsRes, reviewsRes] = await Promise.allSettled([
      fetch(`${apiUrl}/deals/current`, { next: { revalidate: 60 } }),
      fetch(`${apiUrl}/stats/members`, { next: { revalidate: 60 } }),
      fetch(`${apiUrl}/reviews?limit=6`, { next: { revalidate: 60 } }),
    ]);

    let deal: Deal | null = fallbackDeal;
    let memberCount = 312;
    let reviews: Review[] = fallbackReviews;

    if (dealRes.status === 'fulfilled' && dealRes.value.ok) {
      const json = await dealRes.value.json();
      if (json.data) deal = json.data;
    }

    if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
      const json = await statsRes.value.json();
      if (json.data) memberCount = json.data.total_display_count || json.data.joined_count;
    }

    if (reviewsRes.status === 'fulfilled' && reviewsRes.value.ok) {
      const json = await reviewsRes.value.json();
      if (json.data?.reviews) reviews = json.data.reviews;
    }

    return { deal, memberCount, reviews };
  } catch {
    return { deal: fallbackDeal, memberCount: 312, reviews: fallbackReviews };
  }
}

export default async function LandingPage() {
  const { deal, memberCount, reviews } = await getInitialData();

  return (
    <main className="min-h-screen bg-craze-cream text-craze-dark selection:bg-craze-amber selection:text-craze-dark">
      {/* Client-side URL source attribution tracker */}
      <LandingTracker />

      {/* 1. Hero on red background */}
      <Hero memberCount={memberCount} />

      {/* 2. Why join 3 cards */}
      <WhyJoin />

      {/* 3. Weekly deal banner with countdown */}
      <DealBanner initialDeal={deal} />

      {/* 4. Live member counter with count-up animation */}
      <MemberCounter targetCount={memberCount} />

      {/* 5. Menu highlights carousel */}
      <MenuCarousel />

      {/* 6. Craze Wall preview (6 latest sticky notes) */}
      <WallPreview initialReviews={reviews} />

      {/* 7. Footer */}
      <Footer />

      {/* Floating mobile WhatsApp button */}
      <FloatingWhatsApp />
    </main>
  );
}
