'use client';

import confetti from 'canvas-confetti';

export function fireBrandConfetti() {
  if (typeof window === 'undefined') return;

  // Food Craze brand colors: Amber, Red, Cream
  const colors = ['#FDBC5A', '#C30D1A', '#FDEFDA', '#FFD700'];

  // Left cannon
  confetti({
    particleCount: 40,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.8 },
    colors,
    disableForReducedMotion: true,
  });

  // Right cannon
  confetti({
    particleCount: 40,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.8 },
    colors,
    disableForReducedMotion: true,
  });
}
