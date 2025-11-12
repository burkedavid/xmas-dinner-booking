/**
 * Generate a unique booking reference
 */
export function generateBookingReference(): string {
  const prefix = 'XM';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate Monzo payment link
 */
export function generateMonzoLink(amount: number): string {
  const baseUrl = process.env.MONZO_BASE_URL || 'https://monzo.me/davidburke45';
  const hash = process.env.MONZO_HASH || 'UFLFPl';
  const formattedAmount = amount.toFixed(2);

  return `${baseUrl}/${formattedAmount}?h=${hash}`;
}

/**
 * Calculate total deposit amount
 */
export function calculateTotalDeposit(numberOfGuests: number): number {
  const depositPerPerson = parseFloat(process.env.DEPOSIT_AMOUNT || '10.00');
  return numberOfGuests * depositPerPerson;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (UK format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Tailwind CSS class merging utility
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
