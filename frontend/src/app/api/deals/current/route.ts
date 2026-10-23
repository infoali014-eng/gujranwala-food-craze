import { NextResponse } from 'next/server';
import { getCurrentDeal } from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const deal = await getCurrentDeal();
  return NextResponse.json({ data: deal, error: null });
}
