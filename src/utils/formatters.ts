/**
 * Format currency amount with currency symbol
 * Strips .00 if whole number to avoid visual clutter, but preserves true decimals (e.g. .50 or .75)
 */
export function formatCurrency(amount: number, symbol: string = '৳', forceDecimals: boolean = false): string {
  const num = amount || 0;
  const isWhole = Number.isInteger(num) || Math.abs(Math.round(num) - num) < 0.001;
  const formatted = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: forceDecimals ? 2 : (isWhole ? 0 : 2),
    maximumFractionDigits: 2,
  }).format(num);

  return `${symbol}${formatted}`;
}

/**
 * Format Date & Time for Receipts and Invoices
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateOnly(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimeOnly(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
