import { NextRequest, NextResponse } from 'next/server';
import { restoreReview, isValidAdminToken } from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get('authorization');
  if (!isValidAdminToken(authHeader)) {
    return NextResponse.json(
      { data: null, error: { code: 'AUTH_MISSING', message: 'Admin authentication required.' } },
      { status: 401 }
    );
  }

  const { id } = params;
  await restoreReview(id);

  return NextResponse.json({
    data: { success: true, message: 'Review restored successfully' },
    error: null,
  });
}
