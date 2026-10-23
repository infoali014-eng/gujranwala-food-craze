import { NextRequest, NextResponse } from 'next/server';
import {
  isValidAdminToken,
  updateComplaintStatus,
  updateComplaintNotes,
  deleteComplaint,
  ComplaintStatus,
} from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

export async function PATCH(
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

  try {
    const body = await req.json();

    let updated = null;

    if (body.status) {
      const validStatuses: ComplaintStatus[] = ['new', 'in_progress', 'resolved'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { data: null, error: { code: 'INVALID_STATUS', message: 'Invalid status value.' } },
          { status: 400 }
        );
      }
      updated = await updateComplaintStatus(id, body.status);
    }

    if (typeof body.admin_notes === 'string') {
      updated = await updateComplaintNotes(id, body.admin_notes.trim());
    }

    if (!updated) {
      return NextResponse.json(
        { data: null, error: { code: 'NOT_FOUND', message: 'Complaint not found.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated, error: null });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating complaint';
    return NextResponse.json(
      { data: null, error: { code: 'UPDATE_FAILED', message: msg } },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

  const success = await deleteComplaint(id);
  if (!success) {
    return NextResponse.json(
      { data: null, error: { code: 'DELETE_FAILED', message: 'Could not delete complaint.' } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: { success: true, message: 'Complaint soft-deleted successfully.' },
    error: null,
  });
}
