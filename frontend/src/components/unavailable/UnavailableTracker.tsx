'use client';

import { useEffect } from 'react';
import { trackClickApi } from '@/lib/api';

export const UnavailableTracker: React.FC = () => {
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('[data-track-click]');
      if (target) {
        const buttonName = target.getAttribute('data-track-click');
        if (buttonName) {
          try {
            trackClickApi({
              source: 'unavailable-page',
              button: buttonName,
            });
          } catch {
            // Ignore tracking errors
          }
        }
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  return null;
};
