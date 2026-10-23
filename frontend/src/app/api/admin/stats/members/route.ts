import { NextRequest, NextResponse } from 'next/server';
import { updateMemberStats, isValidAdminToken } from '@/lib/serverStorage';

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
  const joinedCount = Number(body.joined_count) || 312;
  const displayBoost = typeof body.display_boost === 'number' ? body.display_boost : undefined;

  const updated = await updateMemberStats(joinedCount, displayBoost);
  return NextResponse.json({ data: updated, error: null });
}
