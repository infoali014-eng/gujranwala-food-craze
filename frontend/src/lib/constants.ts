/**
 * Application Constants
 * Hardcoded values for instant zero-latency accessibility across all pages.
 */

export const HARDCODED_WHATSAPP_LINK =
  'https://chat.whatsapp.com/B9mYGX1vmzx4OQQjUliwzQ?s=cl&p=a&mlu=4&ilr=4';

export const HARDCODED_FOODPANDA_LINK = 'https://www.foodpanda.pk';

/**
 * Resolves the active WhatsApp invite link.
 * Falls back immediately to the hardcoded link if dynamic link is missing,
 * empty, or contains sample/placeholder values.
 */
export function resolveWhatsAppLink(dynamicLink?: string | null): string {
  if (
    dynamicLink &&
    typeof dynamicLink === 'string' &&
    dynamicLink.trim().length > 0 &&
    !dynamicLink.includes('sample-gfc-invite') &&
    !dynamicLink.includes('your-group-invite') &&
    !dynamicLink.includes('your-invite-code')
  ) {
    return dynamicLink.trim();
  }
  return HARDCODED_WHATSAPP_LINK;
}
