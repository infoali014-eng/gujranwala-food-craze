export interface NormalizedPhoneResult {
  valid: boolean;
  normalized: string;
  rawDigits: string;
  waNumber: string;
  error?: string;
}

export function normalizePakistaniPhone(input: string): NormalizedPhoneResult {
  const defaultError = 'Sahi mobile number likhein, jaise 0300 1234567';

  if (!input || typeof input !== 'string') {
    return { valid: false, normalized: '', rawDigits: '', waNumber: '', error: defaultError };
  }

  let cleaned = input.trim();

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

export function generateReferenceNumber(type: string): string {
  const prefix = type === 'complaint' ? 'C' : type === 'suggestion' ? 'S' : 'O';
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GFC-${prefix}-${code}`;
}
