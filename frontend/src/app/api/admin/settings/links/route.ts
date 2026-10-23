import { NextRequest, NextResponse } from 'next/server';
import { updateSiteSettings, isValidAdminToken } from '@/lib/serverStorage';

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
  const updated = await updateSiteSettings(body.whatsapp_link, body.foodpanda_link);

  return NextResponse.json({ data: updated, error: null });
}
