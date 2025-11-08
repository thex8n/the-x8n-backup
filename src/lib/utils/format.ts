/**
 * Formatting utilities for displaying data consistently across the application
 */

import { CURRENCY_LOCALE, CURRENCY_CODE, CURRENCY_DECIMALS } from '@/constants/ui';

// ============================================================================
// Currency Formatting
// ============================================================================

/**
 * Formats a price value to Colombian Peso currency format
 *
 * @param price - The price to format (can be null for optional prices)
 * @returns Formatted currency string or '-' if price is null
 *
 * @example
 * ```typescript
 * formatCurrency(12500)      // "$12,500"
 * formatCurrency(null)       // "-"
 * formatCurrency(0)          // "$0"
 * ```
 */
export function formatCurrency(price: number | null): string {
  if (price === null) return '-';

  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: CURRENCY_DECIMALS,
    maximumFractionDigits: CURRENCY_DECIMALS,
  }).format(price);
}

/**
 * Formats a number as currency without the currency symbol
 *
 * @param price - The price to format
 * @returns Formatted number string
 *
 * @example
 * ```typescript
 * formatNumber(12500)  // "12,500"
 * formatNumber(0)      // "0"
 * ```
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Formats an ISO date string to a human-readable format
 *
 * @param date - ISO date string from database
 * @param includeTime - Whether to include time in the output
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * formatDate('2024-01-15T10:30:00Z')              // "15/01/2024"
 * formatDate('2024-01-15T10:30:00Z', true)        // "15/01/2024 10:30"
 * ```
 */
export function formatDate(date: string, includeTime = false): string {
  const dateObj = new Date(date);

  if (includeTime) {
    return new Intl.DateTimeFormat(CURRENCY_LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  }

  return new Intl.DateTimeFormat(CURRENCY_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Formats a date to a relative time string (e.g., "hace 2 horas")
 *
 * @param date - ISO date string from database
 * @returns Relative time string
 *
 * @example
 * ```typescript
 * formatRelativeTime('2024-01-15T10:00:00Z')  // "hace 2 horas" (if current time is 12:00)
 * ```
 */
export function formatRelativeTime(date: string): string {
  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'hace unos segundos';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes === 1 ? '' : 's'}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours === 1 ? '' : 's'}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `hace ${diffInDays} día${diffInDays === 1 ? '' : 's'}`;
  }

  return formatDate(date);
}

// ============================================================================
// Stock Formatting
// ============================================================================

/**
 * Stock status indicator
 */
export type StockStatus = 'ok' | 'low' | 'out';

/**
 * Gets the stock status based on current and minimum stock levels
 *
 * @param currentStock - Current stock quantity
 * @param minimumStock - Minimum stock threshold
 * @returns Stock status indicator
 *
 * @example
 * ```typescript
 * getStockStatus(10, 5)   // "ok"
 * getStockStatus(3, 5)    // "low"
 * getStockStatus(0, 5)    // "out"
 * ```
 */
export function getStockStatus(
  currentStock: number,
  minimumStock: number
): StockStatus {
  if (currentStock === 0) return 'out';
  if (currentStock <= minimumStock) return 'low';
  return 'ok';
}

/**
 * Formats stock status with a human-readable label
 *
 * @param currentStock - Current stock quantity
 * @param minimumStock - Minimum stock threshold
 * @returns Formatted stock status string
 *
 * @example
 * ```typescript
 * formatStockStatus(10, 5)   // "En stock"
 * formatStockStatus(3, 5)    // "Stock bajo"
 * formatStockStatus(0, 5)    // "Sin stock"
 * ```
 */
export function formatStockStatus(
  currentStock: number,
  minimumStock: number
): string {
  const status = getStockStatus(currentStock, minimumStock);

  switch (status) {
    case 'ok':
      return 'En stock';
    case 'low':
      return 'Stock bajo';
    case 'out':
      return 'Sin stock';
  }
}

/**
 * Gets CSS classes for stock status badge
 *
 * @param currentStock - Current stock quantity
 * @param minimumStock - Minimum stock threshold
 * @returns Tailwind CSS classes for badge styling
 */
export function getStockStatusClasses(
  currentStock: number,
  minimumStock: number
): string {
  const status = getStockStatus(currentStock, minimumStock);

  switch (status) {
    case 'ok':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'low':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'out':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  }
}

// ============================================================================
// Text Formatting
// ============================================================================

/**
 * Truncates a string to a maximum length and adds ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default 50)
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * ```typescript
 * truncateText('This is a very long text', 10)  // "This is a..."
 * truncateText('Short', 10)                      // "Short"
 * ```
 */
export function truncateText(text: string, maxLength = 50): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Capitalizes the first letter of a string
 *
 * @param text - Text to capitalize
 * @returns Capitalized text
 *
 * @example
 * ```typescript
 * capitalize('hello world')  // "Hello world"
 * ```
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Converts a string to title case
 *
 * @param text - Text to convert
 * @returns Title case text
 *
 * @example
 * ```typescript
 * toTitleCase('hello world')  // "Hello World"
 * ```
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}
