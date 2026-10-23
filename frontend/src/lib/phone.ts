/**
 * Utilities for Pakistani mobile number validation, normalization, and reference generation.
 */

export interface NormalizedPhoneResult {
  valid: boolean;
  normalized: string; // "0300 1234567"
  rawDigits: string; // "03001234567"
  waNumber: string; // "923001234567"
  error?: string;
}

/**
 * Validates and normalizes Pakistani mobile numbers.
 * Accepts formats:
 * - 03XX XXXXXXX
 * - 03XXXXXXXXX
 * - +92 3XX XXXXXXX
 * - +923XXXXXXXXX
 * - 00923XXXXXXXXX
 * - 923XXXXXXXXX
 * - 3XXXXXXXXX (10 digits)
 */
export function normalizePakistaniPhone(input: string): NormalizedPhoneResult {
  const defaultError = 'Sahi mobile number likhein, jaise 0300 1234567';

  if (!input || typeof input !== 'string') {
    return { valid: false, normalized: '', rawDigits: '', waNumber: '', error: defaultError };
  }

  let cleaned = input.trim();

  // Normalize international prefix to leading zero
  if (cleaned.startsWith('+92')) {
    cleaned = '0' + cleaned.slice(3).trim();
  } else if (cleaned.startsWith('0092')) {
    cleaned = '0' + cleaned.slice(4).trim();
  } else if (cleaned.startsWith('92') && cleaned.replace(/\D/g, '').length >= 12) {
    cleaned = '0' + cleaned.slice(2).trim();
  } else if (cleaned.startsWith('3') && cleaned.replace(/\D/g, '').length === 10) {
    cleaned = '0' + cleaned;
  }

  const digits = cleaned.replace(/\D/g, '');

  // Must be 11 digits starting with 03 (Pakistani mobile operator codes: 030X to 037X)
  if (/^03[0-9]{9}$/.test(digits)) {
    const formatted = `${digits.slice(0, 4)} ${digits.slice(4)}`;
    const wa = `92${digits.slice(1)}`;
    return {
      valid: true,
      normalized: formatted,
      rawDigits: digits,
      waNumber: wa,
    };
  }

  return {
    valid: false,
    normalized: '',
    rawDigits: '',
    waNumber: '',
    error: defaultError,
  };
}

/**
 * Generates a WhatsApp chat direct link with pre-filled message.
 */
export function getWhatsAppContactLink(phone: string, text: string): string {
  const norm = normalizePakistaniPhone(phone);
  const wa = norm.valid ? norm.waNumber : phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${wa}?text=${encodedText}`;
}

export type ComplaintType = 'complaint' | 'suggestion' | 'other';
export type ComplaintStatus = 'new' | 'in_progress' | 'resolved';

/**
 * Generates an easy-to-quote reference number like GFC-C-7K8M.
 * Excludes ambiguous characters (0, O, 1, I).
 */
export function generateReferenceNumber(type: ComplaintType): string {
  const prefix = type === 'complaint' ? 'C' : type === 'suggestion' ? 'S' : 'O';
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GFC-${prefix}-${code}`;
}
