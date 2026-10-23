'use client';

import React, { useState } from 'react';
import { Review, getReviews } from '@/lib/api';
import { StickyNote } from './StickyNote';
import { Button } from '@/components/ui/Button';
import { Pin } from 'lucide-react';
import { COPY } from '@/lib/copy';

interface NoteBoardProps {
  initialReviews: Review[];
  initialCursor: string | null;
  newReviewId?: string | null;
}

export const NoteBoard: React.FC<NoteBoardProps> = ({
  initialReviews,
  initialCursor,
  newReviewId,
}) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load more notes using cursor pagination in batches of 12 for mobile performance
  const handleLoadMore = async () => {
    if (!cursor || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const res = await getReviews(12, cursor);

      if (res.data) {
        setReviews((prev) => [...prev, ...res.data!.reviews]);
        setCursor(res.data.nextCursor);
      }
    } catch (err) {
      console.error('Error loading more notes:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="w-full">
      {/* Board Surface */}
      <div className="rounded-3xl bg-[#C99859] border-4 sm:border-8 border-[#996931] shadow-2xl p-4 sm:p-8 relative overflow-hidden">
        {/* Subtle Cork Texture Overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#5a3915 1px, transparent 1px), radial-gradient(#3e2309 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 8px 8px',
          }}
        />

        {/* Empty State (Clean SVG, no emoji) */}
        {reviews.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center relative z-10 px-4">
            <div className="w-14 h-14 rounded-full bg-[#996931]/30 flex items-center justify-center text-[#2B0A0C] mb-4">
              <Pin className="w-7 h-7" />
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl uppercase tracking-wider text-[#2B0A0C]">
              {COPY.wall.emptyState}
            </h3>
            <p className="font-serif italic text-xs sm:text-sm text-[#2B0A0C]/80 mt-1 max-w-sm">
              Upar diye gaye form se apna review likhein aur wall par apna note lagayein!
            </p>
          </div>
        ) : (
          <div className="relative z-10">
            {/* Sticky Notes Grid: 1 col under 420px, 2 col from 420px, 3 col on desktop */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {reviews.map((review) => (
                <StickyNote
                  key={review.id}
                  review={review}
                  isNew={review.id === newReviewId}
                  allowShare={true}
                />
              ))}

              {/* Skeletons while loading more */}
              {isLoadingMore && (
                <>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="rounded-xl border border-black/10 bg-white/40 p-5 min-h-[210px] animate-pulse flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="h-5 bg-black/10 rounded w-1/2" />
                        <div className="h-4 bg-black/10 rounded w-full" />
                        <div className="h-4 bg-black/10 rounded w-4/5" />
                      </div>
                      <div className="h-4 bg-black/10 rounded w-1/3" />
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Load More Pagination (Text only, no arrows, no emojis) */}
            {cursor && (
              <div className="mt-8 sm:mt-10 text-center">
                <Button
                  onClick={handleLoadMore}
                  variant="primary"
                  size="md"
                  isLoading={isLoadingMore}
                  className="shadow-chunky-amber min-h-[48px] px-8"
                >
                  {isLoadingMore ? 'Loading notes...' : COPY.wall.loadMore}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
