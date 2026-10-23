import { NextRequest, NextResponse } from 'next/server';
import { isValidAdminToken, restoreComplaint } from '@/lib/serverStorage';

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
  if (!id) {
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_ID', message: 'Complaint ID is required.' } },
      { status: 400 }
    );
  }

  const success = await restoreComplaint(id);
  if (!success) {
    return NextResponse.json(
      { data: null, error: { code: 'RESTORE_FAILED', message: 'Could not restore complaint.' } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: { success: true, message: 'Complaint restored successfully.' },
    error: null,
  });
}
