const SRC_STORAGE_KEY = 'gfc_utm_source';

export function getSource(): string {
  if (typeof window === 'undefined') return 'direct';
  try {
    return sessionStorage.getItem(SRC_STORAGE_KEY) || 'direct';
  } catch {
    return 'direct';
  }
}

export function initSourceTracking(): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const src = params.get('src');
    if (src) {
      sessionStorage.setItem(SRC_STORAGE_KEY, src.toLowerCase().trim());
    } else if (!sessionStorage.getItem(SRC_STORAGE_KEY)) {
      sessionStorage.setItem(SRC_STORAGE_KEY, 'direct');
    }
  } catch {
    // Graceful fallback for restricted storage
  }
}

export function trackClick(button: string): void {
  if (typeof window === 'undefined') return;

  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const apiUrl = (
    rawApiUrl || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api')
  ).replace(/\/+$/, '');

  const source = getSource();
  const payload = JSON.stringify({ source, button });
  const endpoint = `${apiUrl}/track/click`;

  // Use sendBeacon for zero-delay mobile execution if supported
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon(endpoint, blob);
      if (sent) return;
    } catch {
      // Fall through to fetch
    }
  }

  // Non-blocking fetch with keepalive
  try {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Non-blocking telemetry
    });
  } catch {
    // Ignore telemetry errors
  }
}
