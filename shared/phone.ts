export const E164_PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

/**
 * Normalize user input into a best-effort E.164 string.
 *
 * - Strips all characters except digits and leading `+`
 * - If no leading `+` is present, prepends one
 *
 * Note: This does not guarantee the number is valid; call `isValidE164Phone`.
 */
export function normalizeE164Phone(input: string): string {
  const trimmed = (input ?? '').trim();
  if (!trimmed) return '';

  // Keep a single leading '+' (if present), strip other non-digits.
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (!digitsOnly) return '';

  return `${hasPlus ? '+' : '+'}${digitsOnly}`;
}

export function isValidE164Phone(input: string): boolean {
  return E164_PHONE_REGEX.test(input);
}
