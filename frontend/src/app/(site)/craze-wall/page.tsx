import React from 'react';
import type { Metadata } from 'next';
import { CrazeWallClient } from '@/components/wall/CrazeWallClient';
import { Review } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Craze Wall: Aapki Baat, Aapka Note | Gujranwala Food Craze',
  description:
    'Check out customer sticky-note reviews or slap your own note on the Craze Wall. Authentic feedback from Gujranwala food lovers.',
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

async function getInitialReviews() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  try {
    const res = await fetch(`${apiUrl}/reviews?limit=12`, {
      next: { revalidate: 30 },
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data?.reviews) {
        return {
          reviews: json.data.reviews as Review[],
          nextCursor: (json.data.nextCursor as string | null) || null,
        };
      }
    }
  } catch (err) {
    console.warn('Backend not reached during static generation, using fallback:', err);
  }

  return {
    reviews: fallbackReviews,
    nextCursor: null,
  };
}

export default async function CrazeWallPage() {
  const { reviews, nextCursor } = await getInitialReviews();

  return <CrazeWallClient initialReviews={reviews} initialCursor={nextCursor} />;
}
