import { NextRequest, NextResponse } from 'next/server';
import { getAllReviews, isValidAdminToken } from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!isValidAdminToken(authHeader)) {
    return NextResponse.json(
      { data: null, error: { code: 'AUTH_MISSING', message: 'Admin authentication required.' } },
      { status: 401 }
    );
  }

  const reviews = await getAllReviews();
  return NextResponse.json({ data: reviews, error: null });
}
