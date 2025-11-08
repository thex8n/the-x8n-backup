/**
 * Validation utility functions
 * Provides reusable validation logic for forms and data
 */

import {
  MIN_PRODUCT_NAME_LENGTH,
  MIN_CATEGORY_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '@/constants/ui';
import {
  PRODUCT_MESSAGES,
  CATEGORY_MESSAGES,
  AUTH_MESSAGES,
} from '@/constants/validation';
import type { ProductFormData } from '@/types/product';
import type { CategoryFormData } from '@/types/category';

// ============================================================================
// Product Validation
// ============================================================================

/**
 * Validates product form data before submission
 * Throws an error if validation fails
 *
 * @param data - Product form data to validate
 * @throws {Error} if validation fails with specific error message
 *
 * @example
 * ```typescript
 * try {
 *   validateProductData(formData);
 *   // Proceed with submission
 * } catch (error) {
 *   setError(error.message);
 * }
 * ```
 */
export function validateProductData(data: ProductFormData): void {
  // Validate name
  if (!data.name.trim()) {
    throw new Error(PRODUCT_MESSAGES.NAME_REQUIRED);
  }

  if (data.name.length < MIN_PRODUCT_NAME_LENGTH) {
    throw new Error(PRODUCT_MESSAGES.NAME_TOO_SHORT);
  }

  // Validate that at least code or barcode is provided
  if (!data.code && !data.barcode) {
    throw new Error(PRODUCT_MESSAGES.CODE_OR_BARCODE_REQUIRED);
  }

  // Validate stock quantities
  if (data.stock_quantity < 0) {
    throw new Error(PRODUCT_MESSAGES.STOCK_NEGATIVE);
  }

  if (data.minimum_stock < 0) {
    throw new Error(PRODUCT_MESSAGES.STOCK_MINIMUM_NEGATIVE);
  }

  // Validate prices
  if (data.sale_price !== undefined && data.sale_price < 0) {
    throw new Error(PRODUCT_MESSAGES.PRICE_NEGATIVE);
  }

  if (data.cost_price !== undefined && data.cost_price < 0) {
    throw new Error(PRODUCT_MESSAGES.COST_NEGATIVE);
  }

  // Validate unit of measure
  if (data.unit_of_measure && !data.unit_of_measure.trim()) {
    throw new Error(PRODUCT_MESSAGES.UNIT_REQUIRED);
  }
}

/**
 * Validates product data and returns validation result instead of throwing
 * Useful for form validation with error states
 *
 * @param data - Product form data to validate
 * @returns Object with isValid flag and error message
 */
export function validateProductDataSafe(data: ProductFormData): {
  isValid: boolean;
  error?: string;
} {
  try {
    validateProductData(data);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Error de validación',
    };
  }
}

// ============================================================================
// Category Validation
// ============================================================================

/**
 * Validates category form data before submission
 * Throws an error if validation fails
 *
 * @param data - Category form data to validate
 * @throws {Error} if validation fails with specific error message
 */
export function validateCategoryData(data: CategoryFormData): void {
  // Validate name
  if (!data.name.trim()) {
    throw new Error(CATEGORY_MESSAGES.NAME_REQUIRED);
  }

  if (data.name.length < MIN_CATEGORY_NAME_LENGTH) {
    throw new Error(CATEGORY_MESSAGES.NAME_TOO_SHORT);
  }

  // Validate color
  if (!data.color) {
    throw new Error(CATEGORY_MESSAGES.COLOR_REQUIRED);
  }

  // Validate icon
  if (!data.icon) {
    throw new Error(CATEGORY_MESSAGES.EMOJI_REQUIRED);
  }
}

/**
 * Validates category data and returns validation result
 *
 * @param data - Category form data to validate
 * @returns Object with isValid flag and error message
 */
export function validateCategoryDataSafe(data: CategoryFormData): {
  isValid: boolean;
  error?: string;
} {
  try {
    validateCategoryData(data);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Error de validación',
    };
  }
}

// ============================================================================
// Authentication Validation
// ============================================================================

/**
 * Validates email format
 *
 * @param email - Email address to validate
 * @returns true if email format is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 *
 * @param password - Password to validate
 * @returns Object with isValid flag and error message
 */
export function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (!password) {
    return { isValid: false, error: AUTH_MESSAGES.PASSWORD_REQUIRED };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { isValid: false, error: AUTH_MESSAGES.PASSWORD_TOO_SHORT };
  }

  return { isValid: true };
}

/**
 * Validates registration form data
 *
 * @param email - Email address
 * @param password - Password
 * @param fullName - User's full name
 * @returns Object with isValid flag and error message
 */
export function validateRegistrationData(
  email: string,
  password: string,
  fullName: string
): {
  isValid: boolean;
  error?: string;
} {
  // Validate email
  if (!email) {
    return { isValid: false, error: AUTH_MESSAGES.EMAIL_REQUIRED };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Email inválido' };
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  // Validate full name
  if (!fullName.trim()) {
    return { isValid: false, error: AUTH_MESSAGES.NAME_REQUIRED };
  }

  return { isValid: true };
}

/**
 * Validates login form data
 *
 * @param email - Email address
 * @param password - Password
 * @returns Object with isValid flag and error message
 */
export function validateLoginData(
  email: string,
  password: string
): {
  isValid: boolean;
  error?: string;
} {
  if (!email) {
    return { isValid: false, error: AUTH_MESSAGES.EMAIL_REQUIRED };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Email inválido' };
  }

  if (!password) {
    return { isValid: false, error: AUTH_MESSAGES.PASSWORD_REQUIRED };
  }

  return { isValid: true };
}

// ============================================================================
// Barcode Validation
// ============================================================================

/**
 * Validates barcode format
 * Accepts various barcode formats (EAN-13, UPC, etc.)
 *
 * @param barcode - Barcode string to validate
 * @returns true if barcode format is valid
 */
export function isValidBarcode(barcode: string): boolean {
  // Remove whitespace
  const cleanBarcode = barcode.trim();

  // Must be numeric
  if (!/^\d+$/.test(cleanBarcode)) {
    return false;
  }

  // Common barcode lengths: 8, 12, 13, 14
  const validLengths = [8, 12, 13, 14];
  return validLengths.includes(cleanBarcode.length);
}

/**
 * Sanitizes barcode input by removing invalid characters
 *
 * @param barcode - Raw barcode input
 * @returns Cleaned barcode string
 */
export function sanitizeBarcode(barcode: string): string {
  return barcode.replace(/\D/g, '').trim();
}

// ============================================================================
// Number Validation
// ============================================================================

/**
 * Validates that a value is a positive number
 *
 * @param value - Value to validate
 * @returns true if value is a positive number
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value >= 0 && !isNaN(value);
}

/**
 * Validates that a value is a non-negative integer
 *
 * @param value - Value to validate
 * @returns true if value is a non-negative integer
 */
export function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

/**
 * Parses a string to a safe number, returning 0 if invalid
 *
 * @param value - String value to parse
 * @returns Parsed number or 0 if invalid
 */
export function parseToSafeNumber(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parses a string to a safe integer, returning 0 if invalid
 *
 * @param value - String value to parse
 * @returns Parsed integer or 0 if invalid
 */
export function parseToSafeInteger(value: string): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}
