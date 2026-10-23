'use client';

import { useEffect } from 'react';
import { initSourceTracking } from '@/lib/tracking';

export function LandingTracker() {
  useEffect(() => {
    initSourceTracking();
  }, []);

  return null;
}
