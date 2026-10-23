export function getApiBaseUrl(): string {
  // Server-side runtime inside Next.js (SSR / Server Components):
  // Use Vercel service binding if available
  if (typeof window === 'undefined' && process.env.BACKEND_URL) {
    const backendUrl = process.env.BACKEND_URL.replace(/\/+$/, '');
    return `${backendUrl}/api`;
  }

  // Explicit env override if set
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  // In browser, default to same-origin relative /api routed by Vercel services
  if (typeof window !== 'undefined') {
    return '/api';
  }

  // Local development server fallback
  return 'http://localhost:5000/api';
}

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

// Client helper
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const baseUrl = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const res = await fetch(`${baseUrl}${cleanEndpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        data: null,
        error: json.error || { message: `Request failed with status ${res.status}` },
      };
    }
    return json;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { data: null, error: { message } };
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
  website?: string; // honeypot field
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
