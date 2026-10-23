import { NextRequest, NextResponse } from 'next/server';
import { getLiveReviews, getAllReviews, addReview } from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    if (includeDeleted) {
      const all = await getAllReviews();
      return NextResponse.json({ data: all, error: null });
    }

    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const data = await getLiveReviews(limit);
    return NextResponse.json({ data, error: null });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching reviews';
    return NextResponse.json({ data: null, error: { message: msg } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic validation
    if (!body.name || body.name.trim().length < 2) {
      return NextResponse.json(
        { data: null, error: { message: 'Apna naam kam az kam 2 characters ka likhein.' } },
        { status: 400 }
      );
    }

    if (!body.message || body.message.trim().length < 5) {
      return NextResponse.json(
        { data: null, error: { message: 'Review kam az kam 5 characters ka likhein.' } },
        { status: 400 }
      );
    }

    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
    const note_color = ['cream', 'amber', 'red'].includes(body.note_color)
      ? body.note_color
      : 'cream';

    const newReview = await addReview({
      name: body.name.trim(),
      rating,
      message: body.message.trim(),
      note_color,
      source: body.source || 'direct',
    });

    return NextResponse.json({ data: newReview, error: null }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error creating review';
    return NextResponse.json({ data: null, error: { message: msg } }, { status: 500 });
  }
}
