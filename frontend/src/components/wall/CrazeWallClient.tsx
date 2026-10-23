'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Review } from '@/lib/api';
import { NoteBoard } from './NoteBoard';
import { ReviewForm } from './ReviewForm';
import { Logo } from '@/components/ui/Logo';
import { FloatingWhatsApp } from '@/components/ui/FloatingWhatsApp';
import { ComplaintModal } from './ComplaintModal';
import { MessageSquareWarning } from 'lucide-react';
import { COPY } from '@/lib/copy';

interface CrazeWallClientProps {
  initialReviews: Review[];
  initialCursor: string | null;
}

export const CrazeWallClient: React.FC<CrazeWallClientProps> = ({
  initialReviews,
  initialCursor,
}) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [newNoteId, setNewNoteId] = useState<string | null>(null);
  const [hasPosted, setHasPosted] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  // When a new note is created, prepend immediately to the board
  const handleReviewCreated = (newReview: Review) => {
    setNewNoteId(newReview.id);
    setReviews((prev) => [newReview, ...prev]);
    setHasPosted(true);
  };

  return (
    <div className="min-h-[100dvh] bg-[#F7EBD7] text-craze-dark selection:bg-craze-amber selection:text-craze-dark pb-20 overflow-x-hidden">
      {/* Top Slim Navbar (No arrows, no emojis) */}
      <header className="bg-craze-red-dark border-b border-craze-amber/40 text-craze-cream px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="font-heading uppercase text-sm sm:text-base text-craze-amber hover:text-white transition-colors min-h-[48px] inline-flex items-center"
          >
            Home
          </Link>

          <span className="font-heading text-base sm:text-lg uppercase tracking-wider text-craze-cream">
            {COPY.brand.name}
          </span>

          <Link
            href="/#menu"
            className="font-heading uppercase text-xs sm:text-sm text-craze-cream/80 hover:text-craze-amber transition-colors min-h-[48px] inline-flex items-center"
          >
            Menu
          </Link>
        </div>
      </header>

      {/* 4a. Bold Compact Welcome Hero (Bebas Neue, cream on red, small logo with steam) */}
      <section className="bg-gradient-to-b from-craze-red to-craze-red-dark text-craze-cream px-4 py-6 sm:py-8 text-center border-b-4 border-craze-amber">
        <div className="max-w-xl mx-auto flex flex-col items-center">
          {/* Small Logo with Steam */}
          <div className="mb-2">
            <Logo size="sm" showSteam={true} interactive={false} />
          </div>

          {/* Welcome Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase tracking-wide text-craze-cream leading-tight">
            {COPY.wall.heroTitle}
          </h1>

          {/* Subline in Lora serif with Roman Urdu */}
          <p className="font-serif italic text-sm sm:text-base text-craze-amber mt-1 max-w-md leading-relaxed">
            {COPY.wall.heroSubtitle}
          </p>

          <a
            href="#review-form"
            className="mt-4 inline-flex items-center justify-center font-heading text-sm uppercase tracking-wider bg-craze-amber text-craze-dark px-5 py-2.5 rounded-xl shadow-[0_3px_0_0_#8F0A13] hover:bg-[#ffc66e] active:translate-y-0.5 transition-all min-h-[48px]"
          >
            Apna Note Likhein
          </a>
        </div>
      </section>

      {/* Main Flow: Craze Wall section first, followed by Review Form section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-12">
        {/* 1. Sticky Note Wall Section */}
        <section className="space-y-4">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl uppercase tracking-wider text-craze-red">
              {COPY.wall.title}
            </h2>
            <p className="font-serif italic text-xs sm:text-sm text-craze-dark/75 mt-0.5">
              {COPY.wall.subtitle}
            </p>
          </div>

          {/* Corkboard with Notes */}
          <NoteBoard
            initialReviews={reviews}
            initialCursor={initialCursor}
            newReviewId={newNoteId}
          />
        </section>

        {/* 2. Review Form / WhatsApp Success Card */}
        <section className="max-w-xl mx-auto pt-4">
          <ReviewForm
            onReviewCreated={handleReviewCreated}
            onPostStatusChange={setHasPosted}
          />
        </section>

        {/* 3. Complaints & Suggestions Entry Point (Subtle, modest secondary section) */}
        <section className="max-w-xl mx-auto pt-4 pb-2 text-center">
          <div className="bg-[#FAF3E8] border-2 border-dashed border-craze-amber/60 rounded-2xl p-5 sm:p-6 shadow-xs">
            <p className="font-serif italic text-xs sm:text-sm text-craze-dark/85 max-w-md mx-auto mb-3.5 leading-relaxed">
              {COPY.complaints.entryHeadline}
            </p>
            <button
              type="button"
              onClick={() => setIsComplaintModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-craze-red/40 bg-white hover:bg-craze-red/5 active:bg-craze-red/10 text-craze-red font-heading text-sm sm:text-base uppercase tracking-wider transition-colors min-h-[48px] shadow-xs cursor-pointer"
            >
              <MessageSquareWarning className="w-4 h-4 text-craze-red shrink-0" />
              <span>{COPY.complaints.entryButton}</span>
            </button>
          </div>
        </section>
      </main>

      {/* Complaints Submission Modal */}
      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
      />

      {/* Footer (No em/en dashes, no emojis) */}
      <footer className="mt-16 text-center text-xs text-craze-dark/60 font-sans px-4">
        <p>{COPY.footer.copyright}</p>
        <p className="mt-1 text-[11px] font-serif italic text-craze-dark/70">
          {COPY.footer.tagline}
        </p>
      </footer>

      {/* Floating WhatsApp Button (Hides when user has posted or when keyboard is open) */}
      <FloatingWhatsApp hasPosted={hasPosted} />
    </div>
  );
};
