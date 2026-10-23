'use client';

import React, { useEffect, useState } from 'react';
import { Flame, Users } from 'lucide-react';
import { getMemberStats } from '@/lib/api';
import { COPY } from '@/lib/copy';

interface MemberCounterProps {
  targetCount?: number;
}

export const MemberCounter: React.FC<MemberCounterProps> = ({ targetCount = 312 }) => {
  const [actualTarget, setActualTarget] = useState(targetCount);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    getMemberStats()
      .then((res) => {
        if (mounted && res.data) {
          const total = res.data.total_display_count || res.data.joined_count;
          if (total) setActualTarget(total);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let start = Math.max(0, actualTarget - 80);
    const duration = 1800; // ms
    const steps = 40;
    const increment = (actualTarget - start) / steps;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= actualTarget) {
        setDisplayCount(actualTarget);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(start));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [actualTarget]);

  return (
    <section className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-craze-amber/15 via-craze-amber/25 to-craze-amber/15 border-2 border-craze-amber rounded-3xl p-6 sm:p-8 text-center shadow-sm flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-craze-red text-craze-cream text-xs font-sans font-bold uppercase tracking-widest mb-3 shadow-sm">
          <Flame className="w-3.5 h-3.5 fill-craze-amber text-craze-amber" />
          <span>Growing Craze Community</span>
        </div>

        <div className="flex items-center justify-center gap-3 my-2">
          <Flame className="w-10 h-10 sm:w-12 sm:h-12 fill-craze-red text-craze-red" />
          <span className="font-heading text-5xl sm:text-6xl md:text-7xl text-craze-red leading-none tracking-tight">
            {displayCount.toLocaleString()}+
          </span>
        </div>

        <p className="font-heading text-2xl sm:text-3xl text-craze-dark uppercase tracking-wide mt-1">
          {COPY.hero.memberCountSuffix}
        </p>

        <p className="font-serif italic text-xs sm:text-sm text-craze-dark/75 mt-1 max-w-md">
          Aap bhi aaiye aur Gujranwala ke sab se mazedaar food lovers club ka hissa baniye.
        </p>
      </div>
    </section>
  );
};
