/**
 * Profanity filter checking standard English and common Roman Urdu/Punjabi vulgar slang
 */
const PROFANITY_LIST = [
  // Common English profanities
  'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'cunt', 'dick', 'pussy', 'whore',
  // Common Roman Urdu/Punjabi abusive terms
  'kanjar', 'kutti', 'chutiya', 'harami', 'kamina', 'bhenchod', 'madarchod',
  'randi', 'gandu', 'sala', 'teri ma ki', 'kutta', 'badmash'
];

export function hasProfanity(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return PROFANITY_LIST.some((word) => {
    // Check whole word or token
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lower);
  });
}

export function filterProfanity(text: string): { isProfane: boolean; cleanText: string } {
  if (!text) return { isProfane: false, cleanText: '' };

  let isProfane = false;
  let cleanText = text;

  PROFANITY_LIST.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(cleanText)) {
      isProfane = true;
      cleanText = cleanText.replace(regex, '***');
    }
  });

  return { isProfane, cleanText };
}
