'use client';

import React, { useEffect, useState } from 'react';
import { Review, getReviews } from '@/lib/api';
import { StickyNote } from '@/components/wall/StickyNote';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { COPY } from '@/lib/copy';

interface WallPreviewProps {
  initialReviews?: Review[];
}

export const WallPreview: React.FC<WallPreviewProps> = ({ initialReviews = [] }) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  useEffect(() => {
    let mounted = true;
    getReviews(6)
      .then((res) => {
        if (mounted && res.data?.reviews && res.data.reviews.length > 0) {
          setReviews(res.data.reviews);
        }
      })
      .catch(() => {
        // Keep fallback reviews on error
      });

    return () => {
      mounted = false;
    };
  }, []);
  return (
    <Section
      id="craze-wall-preview"
      bg="cream"
      badge="Customer Love"
      title={COPY.wallPreview.title}
      subtitle={COPY.wallPreview.subtitle}
    >
      {/* 6 Sticky Notes Grid (Mobile-friendly columns) */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-4 pb-8">
        {initialReviews.slice(0, 6).map((review) => (
          <StickyNote key={review.id} review={review} />
        ))}
      </div>

      {/* Action Navigation (Buttons text-only, no arrows, no emojis, min 48px touch targets) */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          href="/craze-wall"
          variant="primary"
          size="lg"
          className="shadow-chunky-amber min-h-[48px] w-full sm:w-auto"
        >
          {COPY.wallPreview.viewAll}
        </Button>

        <Button
          href="/craze-wall#review-form"
          variant="outline"
          size="md"
          className="min-h-[48px] w-full sm:w-auto"
        >
          {COPY.wallPreview.leaveNote}
        </Button>
      </div>
    </Section>
  );
};
