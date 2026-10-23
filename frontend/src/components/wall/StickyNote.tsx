'use client';

import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Star, Share2, Check } from 'lucide-react';
import { Review } from '@/lib/api';

export interface StickyNoteProps {
  review: Review;
  interactive?: boolean;
  className?: string;
  isNew?: boolean;
  allowShare?: boolean;
}

// Deterministic rotation kept strictly within 2 degrees (e.g. -2, -1, 1, 2)
function getDeterministicRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const rotations = [-1.8, -0.9, 0.9, 1.8];
  return rotations[Math.abs(hash) % rotations.length];
}

// Relative date without long dashes
function formatRelativeDate(isoDate: string): string {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoDate).toLocaleDateString('en-PK', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recent';
  }
}

export const StickyNote: React.FC<StickyNoteProps> = ({
  review,
  interactive = true,
  className = '',
  isNew = false,
  allowShare = true,
}) => {
  const noteRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const rotation = shouldReduceMotion ? 0 : getDeterministicRotation(review.id || review.name);

  // Background colors for the three note types
  const colorStyles = {
    cream: {
      bg: 'bg-[#FFFDF4] border-[#ECDAB9] text-[#2B0A0C]',
      tape: 'bg-[#ECDAB9]/70',
      meta: 'text-[#2B0A0C]/75',
      starFill: 'text-[#E5A11D] fill-[#E5A11D]',
      shareBtn: 'bg-[#ECDAB9]/30 hover:bg-[#ECDAB9]/60 text-[#2B0A0C]',
    },
    amber: {
      bg: 'bg-[#FFDF80] border-[#E5B53D] text-[#2B0A0C]',
      tape: 'bg-[#E5B53D]/60',
      meta: 'text-[#2B0A0C]/80',
      starFill: 'text-[#B86900] fill-[#B86900]',
      shareBtn: 'bg-[#E5B53D]/30 hover:bg-[#E5B53D]/60 text-[#2B0A0C]',
    },
    red: {
      bg: 'bg-[#C30D1A] border-[#8F0A13] text-[#FDEFDA]',
      tape: 'bg-[#8F0A13]/70',
      meta: 'text-[#FDEFDA]/80',
      starFill: 'text-[#FDBC5A] fill-[#FDBC5A]',
      shareBtn: 'bg-white/10 hover:bg-white/20 text-[#FDEFDA]',
    },
  };

  const currentStyle = colorStyles[review.note_color] || colorStyles.cream;

  // Web Share API on mobile phones with fallback to download
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!noteRef.current || isExporting) return;

    try {
      setIsExporting(true);
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(noteRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const filename = `GujranwalaFoodCraze-Note-${review.name.replace(/\s+/g, '_')}.png`;

      // Try Web Share API for native mobile status sharing
      if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], filename, { type: 'image/png' });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'Gujranwala Food Craze Note',
              text: 'Check out my review on the Craze Wall!',
              files: [file],
            });
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
            return;
          }
        } catch {
          // If native share was canceled or failed, fall through to download
        }
      }

      // Fallback: standard file download
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to export note as image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Toggle straightened state on tap/click (mobile-friendly)
  const handleNoteTap = () => {
    if (interactive && !shouldReduceMotion) {
      setIsTapped(!isTapped);
    }
  };

  // Slap-on drop animation for newly posted notes
  const slapOnAnimation =
    isNew && !shouldReduceMotion
      ? {
          initial: { scale: 1.8, opacity: 0, y: -60, rotate: rotation + 8 },
          animate: {
            scale: isTapped ? 1.03 : 1,
            opacity: 1,
            y: isTapped ? -6 : 0,
            rotate: isTapped ? 0 : rotation,
          },
          transition: { type: 'spring', stiffness: 350, damping: 22 },
        }
      : {
          initial: { opacity: 0, y: 15 },
          animate: {
            opacity: 1,
            y: isTapped ? -6 : 0,
            rotate: isTapped ? 0 : rotation,
            scale: isTapped ? 1.03 : 1,
          },
          transition: { duration: 0.25 },
        };

  return (
    <motion.div
      ref={noteRef}
      {...slapOnAnimation}
      onClick={handleNoteTap}
      whileHover={
        interactive && !shouldReduceMotion
          ? {
              rotate: 0,
              scale: 1.03,
              y: -6,
              zIndex: 30,
              boxShadow: '0 16px 32px rgba(43, 10, 12, 0.22)',
            }
          : undefined
      }
      className={`relative rounded-xl border p-5 shadow-note flex flex-col justify-between min-h-[210px] select-none transition-shadow cursor-pointer ${
        isTapped ? 'z-30 shadow-2xl' : ''
      } ${currentStyle.bg} ${className}`}
    >
      {/* Decorative Washi Tape Graphic at Top */}
      <div
        className={`absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 ${currentStyle.tape} backdrop-blur-xs shadow-xs transform -rotate-1 rounded-xs pointer-events-none`}
      />

      {/* Top Header: Name and Stars */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-heading text-xl uppercase tracking-wider leading-tight">
            {review.name}
          </h4>

          {/* Star rating (pure SVG) */}
          <div
            className="flex items-center gap-0.5 shrink-0 pt-0.5"
            aria-label={`${review.rating} out of 5 stars`}
          >
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating ? currentStyle.starFill : 'text-gray-300 opacity-40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Note Message */}
        <p className="font-sans text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
          “{review.message}”
        </p>
      </div>

      {/* Bottom Footer: Date, Source and WhatsApp Status Image Export */}
      <div
        className={`mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-sans ${currentStyle.meta}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span>{formatRelativeDate(review.created_at)}</span>
          {review.source && review.source !== 'direct' && (
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
              via {review.source}
            </span>
          )}
        </div>

        {/* Share Button (Touch friendly min 48px target, no arrows, no emojis) */}
        {allowShare && (
          <button
            onClick={handleShare}
            disabled={isExporting}
            type="button"
            title="Share image on WhatsApp Status"
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-colors border border-black/10 min-h-[48px] min-w-[48px] cursor-pointer ${currentStyle.shareBtn}`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Downloaded</span>
              </>
            ) : isExporting ? (
              <span>Saving...</span>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Status</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};
