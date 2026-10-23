import { NextRequest, NextResponse } from 'next/server';
import { addComplaint, ComplaintType } from '@/lib/serverStorage';
import { normalizePakistaniPhone, generateReferenceNumber } from '@/lib/phone';

export const dynamic = 'force-dynamic';

// In-memory sliding rate limiter per IP (max 3 submissions per hour)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_SUBMISSIONS_PER_HOUR = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_SUBMISSIONS_PER_HOUR) {
    rateLimitMap.set(ip, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

function sanitizeText(str: string): string {
  return str.replace(/<[^>]*>?/gm, '').trim();
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP determination for rate limiting
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'anonymous-client';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Aap bohat ziada paigham bhej chuke hain. Thori der baad koshish karein.',
          },
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 2. Spam trap / Honeypot check (real users never fill this)
    if (body.website && String(body.website).trim().length > 0) {
      // Silently discard spam submission while returning fake success so bots do not retry
      return NextResponse.json(
        {
          data: { reference_number: 'GFC-C-8888' },
          error: null,
        },
        { status: 201 }
      );
    }

    // 3. Validation
    const rawType = body.type || 'complaint';
    const validTypes: ComplaintType[] = ['complaint', 'suggestion', 'other'];
    const type: ComplaintType = validTypes.includes(rawType) ? rawType : 'complaint';

    const rawName = typeof body.name === 'string' ? sanitizeText(body.name) : '';
    if (rawName.length < 2 || rawName.length > 40) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: 'VALIDATION_NAME',
            message: 'Apna naam 2 se 40 characters ka likhein.',
          },
        },
        { status: 400 }
      );
    }

    // Validate Pakistani mobile phone number
    const phoneResult = normalizePakistaniPhone(body.phone || '');
    if (!phoneResult.valid) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: 'VALIDATION_PHONE',
            message: phoneResult.error || 'Sahi mobile number likhein, jaise 0300 1234567',
          },
        },
        { status: 400 }
      );
    }

    const rawMessage = typeof body.message === 'string' ? sanitizeText(body.message) : '';
    if (rawMessage.length < 10 || rawMessage.length > 1000) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: 'VALIDATION_MESSAGE',
            message: 'Paigham kam az kam 10 characters ka likhein.',
          },
        },
        { status: 400 }
      );
    }

    const rawOrderDetails =
      typeof body.order_details === 'string' ? sanitizeText(body.order_details).slice(0, 100) : null;

    const source =
      typeof body.source === 'string' && body.source.trim().length > 0
        ? sanitizeText(body.source).slice(0, 30)
        : 'direct';

    // 4. Generate human-readable reference number
    const referenceNumber = generateReferenceNumber(type);

    // 5. Store record securely
    const record = await addComplaint({
      reference_number: referenceNumber,
      type,
      name: rawName,
      phone: phoneResult.normalized,
      order_details: rawOrderDetails,
      message: rawMessage,
      source,
    });

    // PRIVACY ENFORCEMENT: Never return phone number or message to public client
    return NextResponse.json(
      {
        data: {
          reference_number: record.reference_number,
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error submitting complaint';
    return NextResponse.json(
      {
        data: null,
        error: {
          code: 'SERVER_ERROR',
          message: 'Paigham submit nahi ho saka. Internet connection check karein ya dobara koshish karein.',
        },
      },
      { status: 500 }
    );
  }
}
