export interface ApiResponse<T> {
  data: T | null;
  error: { message: string } | null;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  message: string;
  note_color: 'cream' | 'amber' | 'red';
  source?: string | null;
  created_at: string;
  deleted_at?: string | null;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  price_text: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

export interface MemberStats {
  id: string;
  joined_count: number;
  display_boost: number;
  total_display_count: number;
}

export interface SiteLinks {
  id?: number;
  whatsapp_link: string;
  foodpanda_link: string;
  updated_at?: string;
}

export function getApiBaseUrl(): string | null {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  // Never fall back to localhost in production code
  if (process.env.NODE_ENV === 'production') {
    console.error('NEXT_PUBLIC_API_URL is not set');
    return null;
  }

  // Local development only fallback
  return 'http://localhost:5000/api';
}

// Single robust request helper used across the frontend
export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return {
      data: null,
      error: {
        message: 'Server connection URL set nahi hai. Please administrator se rabta karein.',
      },
    };
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;
  const method = (options.method || 'GET').toUpperCase();

  // 10 second timeout using AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    // Read response body as raw text first
    const rawText = await res.text();

    // Try parsing as JSON
    let json: any = null;
    try {
      json = JSON.parse(rawText);
    } catch {
      console.error(
        `[API Non-JSON Response] Status: ${res.status}. Body preview: ${rawText.slice(0, 200)}`
      );
      return {
        data: null,
        error: {
          message: 'Server abhi masla kar raha hai. Thori der baad dobara koshish karein.',
        },
      };
    }

    if (!res.ok) {
      const errorMessage =
        typeof json.error === 'string'
          ? json.error
          : json.error?.message || `Request failed with status ${res.status}`;

      return {
        data: null,
        error: { message: errorMessage },
      };
    }

    return {
      data: json.data !== undefined ? json.data : json,
      error: null,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    // Automatic retry once for GET requests on network/timeout failure
    if (method === 'GET' && !isRetry) {
      console.warn(`[API] Retrying GET ${cleanEndpoint} after network error...`);
      return request<T>(endpoint, options, true);
    }

    const isAbort = err instanceof Error && err.name === 'AbortError';
    console.error(`[API Network Error] ${method} ${fullUrl}:`, err);

    return {
      data: null,
      error: {
        message: isAbort
          ? 'Server response mein waqt lag raha hai. Internet check karein.'
          : 'Server abhi masla kar raha hai. Thori der baad dobara koshish karein.',
      },
    };
  }
}

// Public API
export async function getHealth() {
  return request<{ status: string; service: string; timestamp: string }>('/health');
}

export async function getReviews(limit = 20, cursor?: string) {
  const query = new URLSearchParams();
  query.set('limit', String(limit));
  if (cursor) query.set('cursor', cursor);
  return request<{ reviews: Review[]; nextCursor: string | null }>(`/reviews?${query.toString()}`);
}

export async function createReview(review: {
  name: string;
  rating: number;
  message: string;
  note_color: 'cream' | 'amber' | 'red';
  source?: string;
  website?: string;
}) {
  return request<Review>('/reviews', {
    method: 'POST',
    body: JSON.stringify(review),
  });
}

export async function getCurrentDeal() {
  return request<Deal>('/deals/current');
}

export async function getMemberStats() {
  return request<MemberStats>('/stats/members');
}

export async function getSiteLinks() {
  return request<SiteLinks>('/settings/links');
}

export async function trackClickApi(data: { source: string; button: string }) {
  return request<{ logged: boolean }>('/track/click', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Admin API (Requires Bearer token)
export async function getAdminReviews(token: string, includeDeleted = true) {
  return request<Review[]>(`/admin/reviews?includeDeleted=${includeDeleted}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function deleteReviewApi(id: string, token: string) {
  return request<{ success: boolean; message: string }>(`/admin/reviews/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function restoreReviewApi(id: string, token: string) {
  return request<{ success: boolean; message: string }>(`/admin/reviews/${id}/restore`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateWeeklyDealApi(
  dealData: {
    title: string;
    description: string;
    price_text: string;
    valid_until: string;
    is_active?: boolean;
  },
  token: string
) {
  return request<Deal>('/admin/deal', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dealData),
  });
}

export async function updateMemberStatsApi(
  statsData: {
    joined_count: number;
    display_boost?: number;
  },
  token: string
) {
  return request<MemberStats>('/admin/stats/members', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(statsData),
  });
}

export async function updateSiteLinksApi(
  links: { whatsapp_link: string; foodpanda_link: string },
  token: string
) {
  return request<SiteLinks>('/admin/settings/links', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(links),
  });
}
