export interface ApiResponse<T> {
  data: T | null;
  error: { code?: string; message: string } | null;
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

export type ComplaintType = 'complaint' | 'suggestion' | 'other';
export type ComplaintStatus = 'new' | 'in_progress' | 'resolved';

export interface Complaint {
  id: string;
  reference_number: string;
  type: ComplaintType;
  name: string;
  phone: string;
  order_details?: string | null;
  message: string;
  source?: string | null;
  status: ComplaintStatus;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * Resolves the API base URL in one central function:
 * - If process.env.NEXT_PUBLIC_API_URL is set, use it (trim spaces and any trailing slash).
 * - If not set and Topology is A (same domain / Vercel services), use /api relative prefix.
 * - If not set and Topology is B (two projects), throw clear error code API_URL_MISSING.
 * - Never fall back to localhost in production.
 */
export function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl) {
    const clean = envUrl.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  // Topology A: single Vercel project with Services routing (same origin)
  // In the browser, /api is routed to backend service.
  // In Next.js server runtime, BACKEND_URL binding is injected by Vercel services.
  if (typeof window === 'undefined' && process.env.BACKEND_URL) {
    const backendUrl = process.env.BACKEND_URL.replace(/\/+$/, '');
    return backendUrl.endsWith('/api') ? backendUrl : `${backendUrl}/api`;
  }

  if (typeof window !== 'undefined') {
    return '/api';
  }

  // Never fall back to localhost in production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('API_URL_MISSING');
  }

  // Local development only fallback
  return 'http://localhost:5000/api';
}

export const getApiBaseUrl = getApiBase;

// Single robust request helper used across the frontend
export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<ApiResponse<T>> {
  let baseUrl: string;
  try {
    baseUrl = getApiBase();
  } catch (err: any) {
    if (err?.message === 'API_URL_MISSING') {
      console.error('[API Error] NEXT_PUBLIC_API_URL is missing in production (Topology B)');
      return {
        data: null,
        error: {
          code: 'API_URL_MISSING',
          message: 'Server connection URL set nahi hai. Please administrator se rabta karein.',
        },
      };
    }
    return {
      data: null,
      error: {
        code: 'API_CONFIG_ERROR',
        message: 'Server connection configuration error.',
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
          code: 'INVALID_JSON',
          message: 'Server abhi masla kar raha hai. Thori der baad dobara koshish karein.',
        },
      };
    }

    if (!res.ok) {
      const errObj = json?.error;
      const errorCode =
        typeof errObj === 'object' && errObj?.code
          ? errObj.code
          : `HTTP_${res.status}`;
      const errorMessage =
        typeof errObj === 'string'
          ? errObj
          : errObj?.message || `Request failed with status ${res.status}`;

      return {
        data: null,
        error: {
          code: errorCode,
          message: errorMessage,
        },
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
        code: isAbort ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isAbort
          ? 'Server response mein waqt lag raha hai. Internet check karein.'
          : 'Server abhi masla kar raha hai. Thori der baad dobara koshish karein.',
      },
    };
  }
}

// Public API
export async function getHealth() {
  return request<{ ok: boolean; envConfigured: boolean; missing?: string[] }>('/health');
}

export async function getDbHealth() {
  return request<{ ok: boolean; errorCode?: string | null; hint?: string | null }>('/health/db');
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

// Complaints & Suggestions Public API
export async function createComplaint(complaint: {
  type: ComplaintType;
  name: string;
  phone: string;
  order_details?: string;
  message: string;
  source?: string;
  website?: string;
}) {
  return request<{ reference_number: string }>('/complaints', {
    method: 'POST',
    body: JSON.stringify(complaint),
  });
}

// Complaints & Suggestions Admin API
export async function getAdminComplaints(token: string, includeDeleted = true) {
  return request<Complaint[]>(`/admin/complaints?includeDeleted=${includeDeleted}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateComplaintStatusApi(
  id: string,
  status: ComplaintStatus,
  token: string
) {
  return request<Complaint>(`/admin/complaints/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

export async function updateComplaintNotesApi(
  id: string,
  admin_notes: string,
  token: string
) {
  return request<Complaint>(`/admin/complaints/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ admin_notes }),
  });
}

export async function deleteComplaintApi(id: string, token: string) {
  return request<{ success: boolean; message: string }>(`/admin/complaints/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function restoreComplaintApi(id: string, token: string) {
  return request<{ success: boolean; message: string }>(`/admin/complaints/${id}/restore`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

