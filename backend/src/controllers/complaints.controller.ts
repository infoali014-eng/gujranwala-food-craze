import { Request, Response, NextFunction } from 'express';
import {
  insertComplaint,
  findAllComplaints,
  updateComplaintStatus,
  updateComplaintNotes,
  softDeleteComplaint,
  restoreComplaint,
  ComplaintType,
  ComplaintStatus,
} from '../queries/complaints.queries';
import { sanitizeText } from '../utils/sanitize';
import { normalizePakistaniPhone, generateReferenceNumber } from '../utils/phone';

export async function createComplaintHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, phone, order_details, message, type, source, website } = req.body;

    // Honeypot trap check
    if (website && String(website).trim().length > 0) {
      res.status(201).json({
        data: { reference_number: 'GFC-C-8888' },
        error: null,
      });
      return;
    }

    const cleanName = sanitizeText(name || '');
    if (cleanName.length < 2 || cleanName.length > 40) {
      res.status(400).json({
        data: null,
        error: {
          code: 'VALIDATION_NAME',
          message: 'Apna naam 2 se 40 characters ka likhein.',
        },
      });
      return;
    }

    const phoneValidation = normalizePakistaniPhone(phone || '');
    if (!phoneValidation.valid) {
      res.status(400).json({
        data: null,
        error: {
          code: 'VALIDATION_PHONE',
          message: phoneValidation.error || 'Sahi mobile number likhein, jaise 0300 1234567',
        },
      });
      return;
    }

    const cleanMessage = sanitizeText(message || '');
    if (cleanMessage.length < 10 || cleanMessage.length > 1000) {
      res.status(400).json({
        data: null,
        error: {
          code: 'VALIDATION_MESSAGE',
          message: 'Paigham kam az kam 10 characters ka likhein.',
        },
      });
      return;
    }

    const validTypes: ComplaintType[] = ['complaint', 'suggestion', 'other'];
    const resolvedType: ComplaintType = validTypes.includes(type) ? type : 'complaint';

    const cleanOrderDetails = order_details ? sanitizeText(order_details).slice(0, 100) : null;
    const cleanSource = source ? sanitizeText(source).slice(0, 30) : 'direct';

    const referenceNumber = generateReferenceNumber(resolvedType);

    const record = await insertComplaint({
      reference_number: referenceNumber,
      type: resolvedType,
      name: cleanName,
      phone: phoneValidation.normalized,
      order_details: cleanOrderDetails,
      message: cleanMessage,
      source: cleanSource,
    });

    res.status(201).json({
      data: {
        reference_number: record.reference_number,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function getComplaintsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const complaints = await findAllComplaints(includeDeleted);

    res.status(200).json({
      data: complaints,
      error: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateComplaintHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    let record = null;

    if (status) {
      const validStatuses: ComplaintStatus[] = ['new', 'in_progress', 'resolved'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          data: null,
          error: { code: 'INVALID_STATUS', message: 'Invalid status value.' },
        });
        return;
      }
      record = await updateComplaintStatus(id, status);
    }

    if (typeof admin_notes === 'string') {
      record = await updateComplaintNotes(id, admin_notes.trim());
    }

    if (!record) {
      res.status(404).json({
        data: null,
        error: { code: 'NOT_FOUND', message: 'Complaint not found.' },
      });
      return;
    }

    res.status(200).json({
      data: record,
      error: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteComplaintHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const ok = await softDeleteComplaint(id);

    if (!ok) {
      res.status(404).json({
        data: null,
        error: { code: 'NOT_FOUND', message: 'Complaint not found or already deleted.' },
      });
      return;
    }

    res.status(200).json({
      data: { success: true, message: 'Complaint soft-deleted.' },
      error: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function restoreComplaintHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const ok = await restoreComplaint(id);

    if (!ok) {
      res.status(404).json({
        data: null,
        error: { code: 'NOT_FOUND', message: 'Complaint not found.' },
      });
      return;
    }

    res.status(200).json({
      data: { success: true, message: 'Complaint restored.' },
      error: null,
    });
  } catch (error) {
    next(error);
  }
}
