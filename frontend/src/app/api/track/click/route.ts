import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({
      data: { logged: true, button: body.button || 'unknown' },
      error: null,
    });
  } catch {
    return NextResponse.json({ data: { logged: true }, error: null });
  }
}
