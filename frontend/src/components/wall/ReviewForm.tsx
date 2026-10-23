'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NoteColorPicker, NoteColor } from './NoteColorPicker';
import { createReview, Review } from '@/lib/api';
import { getSource, trackClick } from '@/lib/tracking';
import { fireBrandConfetti } from '@/components/ui/Confetti';
import { useSiteLinks } from '@/context/SiteLinksContext';
import { COPY } from '@/lib/copy';

interface ReviewFormProps {
  onReviewCreated: (newReview: Review) => void;
  onPostStatusChange?: (posted: boolean) => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  onReviewCreated,
  onPostStatusChange,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [noteColor, setNoteColor] = useState<NoteColor>('amber');
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');

  // Field-specific validation errors in Roman Urdu
  const [nameError, setNameError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [hasPosted, setHasPosted] = useState(false);

  const maxChars = 280;
  const { whatsapp_link } = useSiteLinks();
  const whatsappUrl =
    whatsapp_link || process.env.NEXT_PUBLIC_WHATSAPP_LINK || 'https://chat.whatsapp.com/sample-gfc-invite';

  // Check returning visitor state from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('craze_posted') === 'true') {
        setHasPosted(true);
        if (onPostStatusChange) onPostStatusChange(true);
      }
    } catch {
      // Storage restricted
    }
  }, [onPostStatusChange]);

  const validate = (): boolean => {
    let isValid = true;
    setNameError(null);
    setMessageError(null);
    setGeneralError(null);

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setNameError('Apna naam kam az kam 2 characters ka likhein.');
      isValid = false;
    } else if (trimmedName.length > 40) {
      setNameError('Naam 40 characters se ziada nahi ho sakta.');
      isValid = false;
    }

    if (trimmedMessage.length < 5) {
      setMessageError('Khaana kaisa laga? Kam az kam 5 characters ka review likhein.');
      isValid = false;
    } else if (trimmedMessage.length > maxChars) {
      setMessageError(`Review ${maxChars} characters se ziada nahi ho sakta.`);
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isLoading) return;

    try {
      setIsLoading(true);
      const source = getSource();

      const res = await createReview({
        name: name.trim(),
        rating,
        message: message.trim(),
        note_color: noteColor,
        source,
        website: websiteHoneypot, // Honeypot field
      });

      if (res.error) {
        setGeneralError(res.error.message || 'Review submit nahi ho saka. Dobara koshish karein.');
        setIsLoading(false);
        return;
      }

      if (res.data) {
        // Optimistic / Real-time UI update on the wall
        onReviewCreated(res.data);
        fireBrandConfetti();

        // Save persistent post status in localStorage
        try {
          localStorage.setItem('craze_posted', 'true');
        } catch {
          // Ignore storage error
        }

        setHasPosted(true);
        if (onPostStatusChange) onPostStatusChange(true);

        // Reset form inputs
        setName('');
        setMessage('');
        setRating(5);
        setWebsiteHoneypot('');

        // Smoothly scroll to the success card
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      }
    } catch {
      setGeneralError('Network error. Please internet check karein aur dobara koshish karein.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCtaClick = () => {
    fireBrandConfetti();
    trackClick('wall_post_join');
  };

  const handleWriteAnother = () => {
    setHasPosted(false);
    if (onPostStatusChange) onPostStatusChange(false);
  };

  // SUCCESS CARD: Shown immediately after submit or to returning visitors who already posted
  if (hasPosted) {
    return (
      <div
        ref={cardRef}
        id="review-form"
        className="bg-white rounded-3xl border-4 border-craze-amber p-6 sm:p-8 shadow-xl text-center flex flex-col items-center"
      >
        <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-700 mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="font-heading text-3xl sm:text-4xl uppercase tracking-wider text-craze-red mb-2 leading-tight">
          {COPY.wall.successTitle}
        </h3>

        <p className="font-serif italic text-sm sm:text-base text-craze-dark/80 max-w-md mb-6">
          Aapka review live Craze Wall par add ho chuka hai. Ab hamare VIP food lovers group ka hissa baniye.
        </p>

        {/* Big Amber WhatsApp CTA (Full width, min-h 56px, no arrows, no emojis) */}
        <div className="w-full max-w-md mb-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCtaClick}
            className="w-full min-h-[56px] px-6 py-4 rounded-2xl bg-craze-amber text-craze-dark font-heading text-xl sm:text-2xl uppercase tracking-wider shadow-[0_6px_0_0_#b88225] hover:bg-[#ffc66e] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 text-center"
          >
            {/* WhatsApp Logo SVG */}
            <svg
              className="w-6 h-6 fill-current shrink-0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            <span>{COPY.wall.successCta}</span>
          </a>
        </div>

        <p className="font-serif italic text-xs sm:text-sm text-craze-dark/70 mb-6">
          {COPY.wall.successSubline}
        </p>

        {/* Option to write another note */}
        <button
          type="button"
          onClick={handleWriteAnother}
          className="text-xs sm:text-sm font-sans font-bold text-craze-red hover:underline py-2 px-4 rounded-lg min-h-[48px] inline-flex items-center justify-center cursor-pointer"
        >
          {COPY.wall.writeAnother}
        </button>
      </div>
    );
  }

  // REVIEW FORM
  return (
    <div
      ref={cardRef}
      id="review-form"
      className="bg-white rounded-3xl border-4 border-craze-amber p-6 sm:p-8 shadow-xl"
    >
      <div className="mb-4">
        <h3 className="font-heading text-3xl sm:text-4xl uppercase tracking-wider text-craze-red leading-tight">
          {COPY.wall.formTitle}
        </h3>
        <p className="font-serif italic text-xs sm:text-sm text-craze-dark/75 mt-1">
          Aapka review foran Craze Wall par paste ho jayega taake doosray food lovers bhi parh sakein.
        </p>
      </div>

      {generalError && (
        <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border-2 border-craze-red text-craze-red flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm font-sans font-semibold">
            <span>{generalError}</span>
            <button
              type="button"
              onClick={handleSubmit}
              className="block mt-1 underline font-bold"
            >
              Dobara koshish karein
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Anti-spam Honeypot */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <label htmlFor="website">Leave blank</label>
          <input
            id="website"
            type="text"
            name="website"
            value={websiteHoneypot}
            onChange={(e) => setWebsiteHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* 1. Name Input (16px text size to prevent iPhone zoom) */}
        <div>
          <label
            htmlFor="reviewer-name"
            className="block font-heading text-xl uppercase tracking-wider text-craze-dark mb-1.5"
          >
            Apna Naam
          </label>
          <input
            id="reviewer-name"
            type="text"
            required
            autoComplete="name"
            autoCapitalize="words"
            maxLength={40}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(null);
            }}
            placeholder={COPY.wall.namePlaceholder}
            className={`w-full px-4 py-3 rounded-xl border-2 font-sans text-base bg-[#FFFDF7] text-craze-dark placeholder:text-gray-400 focus:outline-none transition-colors ${
              nameError
                ? 'border-red-500 focus:border-red-600'
                : 'border-craze-amber/70 focus:border-craze-red'
            }`}
          />
          {nameError && (
            <span className="block mt-1 text-xs font-sans text-red-600 font-semibold">
              {nameError}
            </span>
          )}
        </div>

        {/* 2. Star Rating (Tap-friendly min 48px target, pure SVG stars) */}
        <div>
          <label className="block font-heading text-xl uppercase tracking-wider text-craze-dark mb-1.5">
            {COPY.wall.ratingLabel}
          </label>
          <div className="flex items-center gap-2 pt-0.5">
            {[1, 2, 3, 4, 5].map((starVal) => {
              const active = hoverRating ? starVal <= hoverRating : starVal <= rating;
              return (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setRating(starVal)}
                  onMouseEnter={() => setHoverRating(starVal)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="w-12 h-12 flex items-center justify-center p-1 cursor-pointer transition-transform active:scale-110 focus:outline-none rounded-xl"
                  aria-label={`${starVal} Star`}
                >
                  <Star
                    className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                      active
                        ? 'text-craze-amber fill-craze-amber drop-shadow-xs'
                        : 'text-gray-300 fill-transparent'
                    }`}
                  />
                </button>
              );
            })}
            <span className="font-heading text-xl text-craze-red ml-1">
              {rating} / 5 Stars
            </span>
          </div>
        </div>

        {/* 3. Review Message (16px text size to prevent iPhone zoom) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="reviewer-message"
              className="font-heading text-xl uppercase tracking-wider text-craze-dark"
            >
              Apna Review
            </label>
            <span
              className={`text-xs font-mono font-bold ${
                message.length > 250 ? 'text-craze-red' : 'text-gray-500'
              }`}
            >
              {message.length} / {maxChars}
            </span>
          </div>
          <textarea
            id="reviewer-message"
            required
            rows={4}
            maxLength={maxChars}
            enterKeyHint="send"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (messageError) setMessageError(null);
            }}
            placeholder={COPY.wall.messagePlaceholder}
            className={`w-full px-4 py-3 rounded-xl border-2 font-sans text-base bg-[#FFFDF7] text-craze-dark placeholder:text-gray-400 focus:outline-none resize-none transition-colors ${
              messageError
                ? 'border-red-500 focus:border-red-600'
                : 'border-craze-amber/70 focus:border-craze-red'
            }`}
          />
          {messageError && (
            <span className="block mt-1 text-xs font-sans text-red-600 font-semibold">
              {messageError}
            </span>
          )}
        </div>

        {/* 4. Note Color Picker (3 large round swatches) */}
        <div>
          <label className="block font-heading text-xl uppercase tracking-wider text-craze-dark mb-1">
            {COPY.wall.colorLabel}
          </label>
          <NoteColorPicker selectedColor={noteColor} onChange={setNoteColor} />
        </div>

        {/* 5. Submit Button (Full width, min-h 56px, text only, no emojis, no arrows) */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="shadow-chunky-amber text-xl min-h-[56px] py-4"
          >
            {isLoading ? COPY.wall.submitting : COPY.wall.submitButton}
          </Button>
        </div>
      </form>
    </div>
  );
};
