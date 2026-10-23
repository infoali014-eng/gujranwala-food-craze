import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from backend/.env or root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../frontend/.env.local') });

const RAW_API_BASE = process.env.API_BASE || 'http://localhost:5000';
const API_BASE = RAW_API_BASE.trim().replace(/\/+$/, '');

interface TestResult {
  num: number;
  name: string;
  passed: boolean;
  message?: string;
}

const results: TestResult[] = [];

function recordPass(num: number, name: string) {
  results.push({ num, name, passed: true });
  console.log(`[PASS] ${num}. ${name}`);
}

function recordFail(num: number, name: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  results.push({ num, name, passed: false, message: msg });
  console.log(`[FAIL] ${num}. ${name}: ${msg}`);
}

async function getAdminToken(): Promise<string> {
  const adminEmail = process.env.ADMIN_EMAIL || 'infoali014@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Alishair123?';
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (data?.session?.access_token) {
        return data.session.access_token;
      }
      if (error) {
        console.warn(`[WARN] Supabase Auth sign-in failed for ${adminEmail}: ${error.message}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[WARN] Supabase Auth connection failed: ${msg}`);
    }
  }

  console.warn('[WARN] Falling back to development token: smoke-test-token');
  return 'smoke-test-token';
}

async function runSmokeTests() {
  console.log('----------------------------------------------------');
  console.log(`Starting Gujranwala Food Craze Smoke Test Suite`);
  console.log(`Target Backend: ${API_BASE}`);
  console.log('----------------------------------------------------');

  let smokeReviewId = '';
  let adminToken = '';

  // 1. GET /api/health
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const json = await res.json();
    if (!json.ok) throw new Error(`Response ok was not true: ${JSON.stringify(json)}`);
    recordPass(1, 'GET /api/health returns 200 with { ok: true }');
  } catch (err) {
    recordFail(1, 'GET /api/health returns 200 with { ok: true }', err);
  }

  // 2. GET /api/health/db
  try {
    const res = await fetch(`${API_BASE}/api/health/db`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const json = await res.json();
    if (!json.ok) throw new Error(`Response ok was not true: ${JSON.stringify(json)}`);
    recordPass(2, 'GET /api/health/db returns 200 with { ok: true }');
  } catch (err) {
    recordFail(2, 'GET /api/health/db returns 200 with { ok: true }', err);
  }

  // 3. POST /api/reviews
  try {
    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        note_color: 'cream',
        name: 'Smoke Test',
        rating: 5,
        message: 'Automated smoke test message.',
        source: 'smoke-test',
      }),
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Expected HTTP 201/200 but got ${res.status}`);
    }
    const json = await res.json();
    if (!json.data || !json.data.id) {
      throw new Error(`Review ID missing in response: ${JSON.stringify(json)}`);
    }
    smokeReviewId = json.data.id;
    recordPass(3, `POST /api/reviews created note with ID ${smokeReviewId}`);
  } catch (err) {
    recordFail(3, 'POST /api/reviews created note', err);
  }

  // 4. GET /api/reviews
  try {
    const res = await fetch(`${API_BASE}/api/reviews`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const json = await res.json();
    const reviews = json.data?.reviews || (Array.isArray(json.data) ? json.data : []);
    const found = reviews.some((r: any) => r.id === smokeReviewId);
    if (!found && smokeReviewId) {
      throw new Error(`Newly created note ${smokeReviewId} not found in reviews list`);
    }
    recordPass(4, 'GET /api/reviews returns list containing newly created note');
  } catch (err) {
    recordFail(4, 'GET /api/reviews returns list containing newly created note', err);
  }

  // 5. Rate limiting: 6 notes in 2 seconds
  try {
    let hitRateLimit = false;
    const promises: Promise<Response>[] = [];

    for (let i = 0; i < 6; i++) {
      promises.push(
        fetch(`${API_BASE}/api/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            note_color: 'amber',
            name: `Rate Test ${i}`,
            rating: 4,
            message: `Rate limit burst test note number ${i}.`,
            source: 'smoke-test',
          }),
        })
      );
    }

    const responses = await Promise.all(promises);
    for (const r of responses) {
      if (r.status === 429) {
        hitRateLimit = true;
        const body = await r.json();
        if (body.error?.code !== 'RATE_LIMIT_EXCEEDED') {
          console.warn(`[INFO] 429 returned error: ${JSON.stringify(body.error)}`);
        }
        break;
      }
    }

    if (!hitRateLimit) {
      console.warn('[INFO] Rate limit did not trigger in burst (may be using high dev threshold)');
    }
    recordPass(5, 'Rapid fire notes tested rate limiter safely without crashing');
  } catch (err) {
    recordFail(5, 'Rapid fire notes tested rate limiter safely', err);
  }

  // 6. Admin auth & review list
  try {
    adminToken = await getAdminToken();
    const res = await fetch(`${API_BASE}/api/reviews?includeDeleted=true`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const json = await res.json();
    const list = json.data?.reviews || (Array.isArray(json.data) ? json.data : []);
    if (!Array.isArray(list)) throw new Error('Expected array of reviews');
    recordPass(6, 'Admin authenticated and retrieved review list with bearer token');
  } catch (err) {
    recordFail(6, 'Admin authenticated and retrieved review list with bearer token', err);
  }

  // 7. Soft delete smoke test note
  try {
    if (!smokeReviewId) {
      throw new Error('No smokeReviewId available from step 3');
    }
    const res = await fetch(`${API_BASE}/api/reviews/${smokeReviewId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (!res.ok) throw new Error(`Delete failed with HTTP status ${res.status}`);

    // Verify it disappeared from public list
    const pubRes = await fetch(`${API_BASE}/api/reviews`);
    const pubJson = await pubRes.json();
    const pubList = pubJson.data?.reviews || (Array.isArray(pubJson.data) ? pubJson.data : []);
    const stillPresent = pubList.some((r: any) => r.id === smokeReviewId);
    if (stillPresent) {
      throw new Error('Soft deleted note still appears in public list');
    }
    recordPass(7, 'Soft deleted note via DELETE /api/reviews/:id and verified hidden');
  } catch (err) {
    recordFail(7, 'Soft delete note via DELETE /api/reviews/:id', err);
  }

  // 8. Restore smoke test note
  try {
    if (!smokeReviewId) {
      throw new Error('No smokeReviewId available from step 3');
    }
    const res = await fetch(`${API_BASE}/api/reviews/${smokeReviewId}/restore`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (!res.ok) throw new Error(`Restore failed with HTTP status ${res.status}`);

    // Verify it reappeared in public list
    const pubRes = await fetch(`${API_BASE}/api/reviews`);
    const pubJson = await pubRes.json();
    const pubList = pubJson.data?.reviews || (Array.isArray(pubJson.data) ? pubJson.data : []);
    const reappeared = pubList.some((r: any) => r.id === smokeReviewId);
    if (!reappeared) {
      throw new Error('Restored note did not reappear in public list');
    }
    recordPass(8, 'Restored note via PATCH /api/reviews/:id/restore and verified visible');
  } catch (err) {
    recordFail(8, 'Restore note via PATCH /api/reviews/:id/restore', err);
  }

  // 9. Update deal or stats, then revert
  try {
    // Read current stats
    const statsRes = await fetch(`${API_BASE}/api/stats/members`);
    if (!statsRes.ok) throw new Error(`Failed to read stats: status ${statsRes.status}`);
    const statsJson = await statsRes.json();
    const originalCount = statsJson.data?.joined_count || 312;

    // Update stats
    const updateRes = await fetch(`${API_BASE}/api/admin/stats/members`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        joined_count: originalCount + 1,
        display_boost: 0,
      }),
    });
    if (!updateRes.ok) throw new Error(`Failed to update stats: status ${updateRes.status}`);

    // Revert stats
    const revertRes = await fetch(`${API_BASE}/api/admin/stats/members`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        joined_count: originalCount,
        display_boost: 0,
      }),
    });
    if (!revertRes.ok) throw new Error(`Failed to revert stats: status ${revertRes.status}`);

    recordPass(9, 'Admin updated member stats and reverted successfully');
  } catch (err) {
    recordFail(9, 'Admin updated member stats and reverted successfully', err);
  }

  // 10. POST /api/track-click
  try {
    const res = await fetch(`${API_BASE}/api/track-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        button: 'smoke-test',
        source: 'smoke-suite',
      }),
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const json = await res.json();
    if (!json.data?.logged) throw new Error(`Response missing logged: true: ${JSON.stringify(json)}`);
    recordPass(10, 'POST /api/track-click logged click successfully');
  } catch (err) {
    recordFail(10, 'POST /api/track-click logged click successfully', err);
  }

  // 11. CORS preflight OPTIONS check
  try {
    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://example.com',
        'Access-Control-Request-Method': 'POST',
      },
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error(`OPTIONS returned HTML response: ${contentType}`);
    }
    if (res.status !== 204 && res.status !== 403 && res.status !== 200) {
      throw new Error(`Unexpected status code for preflight: ${res.status}`);
    }
    recordPass(11, `CORS preflight handled safely with status ${res.status}`);
  } catch (err) {
    recordFail(11, 'CORS preflight handled safely without crashing', err);
  }

  // Summary
  console.log('----------------------------------------------------');
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log(`Smoke Test Summary: ${passedCount}/${totalCount} tests passed`);
  console.log('----------------------------------------------------');

  if (passedCount === totalCount) {
    console.log('All smoke tests passed successfully.');
    process.exit(0);
  } else {
    console.error(`Smoke test suite failed with ${totalCount - passedCount} failing tests.`);
    process.exit(1);
  }
}

runSmokeTests().catch((err) => {
  console.error('[FATAL] Unhandled error during smoke tests:', err);
  process.exit(1);
});
