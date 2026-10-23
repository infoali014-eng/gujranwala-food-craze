import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: 'resilient',
    timestamp: new Date().toISOString(),
  });
}
