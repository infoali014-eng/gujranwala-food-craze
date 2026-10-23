import { NextRequest, NextResponse } from 'next/server';
import { getAdminComplaints, isValidAdminToken } from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!isValidAdminToken(authHeader)) {
    return NextResponse.json(
      { data: null, error: { code: 'AUTH_MISSING', message: 'Admin authentication required.' } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const includeDeleted = searchParams.get('includeDeleted') === 'true';

  const complaints = await getAdminComplaints(includeDeleted);
  return NextResponse.json({ data: complaints, error: null });
}
