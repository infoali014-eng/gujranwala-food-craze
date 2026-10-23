import { NextResponse } from 'next/server';
import { getMemberStats } from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const stats = await getMemberStats();
  return NextResponse.json({ data: stats, error: null });
}
