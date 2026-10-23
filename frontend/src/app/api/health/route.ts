import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    envConfigured: true,
    service: 'gujranwala-food-craze-next-api',
    timestamp: new Date().toISOString(),
  });
}
