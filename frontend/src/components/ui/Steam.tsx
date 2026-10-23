'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface SteamProps {
  color?: string;
  className?: string;
  strands?: number;
}

export const Steam: React.FC<SteamProps> = ({
  color = '#FDEFDA',
  className = '',
  strands = 3,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // If user prefers reduced motion, render static soft vapor lines
  if (shouldReduceMotion) {
    return (
      <div className={`relative flex justify-center items-end h-16 w-24 opacity-30 ${className}`}>
        <svg viewBox="0 0 100 60" className="w-full h-full" fill="none" stroke={color}>
          <path d="M35 50 Q 30 30, 40 10" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 55 Q 55 35, 48 12" strokeWidth="4" strokeLinecap="round" />
          <path d="M65 48 Q 60 28, 68 15" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Generate 3 to 5 realistic steam wisps
  const steamPuffs = [
    { id: 1, xOffset: -16, delay: 0, duration: 2.4, drift: -6 },
    { id: 2, xOffset: 0, delay: 0.8, duration: 2.8, drift: 8 },
    { id: 3, xOffset: 16, delay: 1.4, duration: 2.2, drift: -4 },
    { id: 4, xOffset: -8, delay: 0.4, duration: 2.6, drift: 5 },
    { id: 5, xOffset: 10, delay: 1.8, duration: 2.5, drift: -7 },
  ].slice(0, strands);

  return (
    <div
      aria-hidden="true"
      className={`relative flex justify-center items-end pointer-events-none select-none h-16 w-28 overflow-visible ${className}`}
    >
      {steamPuffs.map((puff) => (
        <motion.div
          key={puff.id}
          className="absolute bottom-1 w-2 rounded-full blur-[1.5px]"
          style={{
            backgroundColor: color,
            left: `calc(50% + ${puff.xOffset}px)`,
          }}
          initial={{
            opacity: 0,
            y: 0,
            x: 0,
            scaleY: 0.8,
            scaleX: 1,
            height: '16px',
          }}
          animate={{
            opacity: [0, 0.75, 0.5, 0],
            y: [-2, -24, -48, -68],
            x: [0, puff.drift * 0.5, puff.drift, puff.drift * 1.5],
            scaleY: [1, 2, 2.5, 3],
            scaleX: [1, 1.8, 2.4, 3],
          }}
          transition={{
            duration: puff.duration,
            repeat: Infinity,
            delay: puff.delay,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      ))}
    </div>
  );
};
