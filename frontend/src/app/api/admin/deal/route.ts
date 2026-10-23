import { NextRequest, NextResponse } from 'next/server';
import { updateDeal, isValidAdminToken } from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!isValidAdminToken(authHeader)) {
    return NextResponse.json(
      { data: null, error: { code: 'AUTH_MISSING', message: 'Admin authentication required.' } },
      { status: 401 }
    );
  }

  const body = await req.json();
  const updated = await updateDeal(body);

  return NextResponse.json({ data: updated, error: null });
}
