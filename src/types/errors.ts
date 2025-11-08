/**
 * Error Types for Server Actions and API Responses
 * Provides type-safe error handling across the application
 */

// ============================================================================
// Server Action Result Types
// ============================================================================

/**
 * Represents an error response from a server action
 */
export interface SupabaseActionError {
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Represents a successful response from a server action
 * @template T - The type of data returned on success
 */
export interface SupabaseActionSuccess<T> {
  success: true;
  data: T;
}

/**
 * Union type representing either a success or error result from a server action
 * @template T - The type of data returned on success
 *
 * @example
 * ```typescript
 * const result: SupabaseActionResult<Product> = await addProduct(data);
 * if (isActionError(result)) {
 *   console.error(result.error);
 * } else {
 *   console.log(result.data);
 * }
 * ```
 */
export type SupabaseActionResult<T> =
  | SupabaseActionSuccess<T>
  | SupabaseActionError;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a server action result is an error
 * @param result - The result to check
 * @returns true if the result is an error, false otherwise
 *
 * @example
 * ```typescript
 * if (isActionError(result)) {
 *   toast.error(result.error);
 *   return;
 * }
 * // TypeScript now knows result is SupabaseActionSuccess
 * console.log(result.data);
 * ```
 */
export function isActionError<T>(
  result: SupabaseActionResult<T>
): result is SupabaseActionError {
  return 'error' in result;
}

/**
 * Type guard to check if a server action result is successful
 * @param result - The result to check
 * @returns true if the result is successful, false otherwise
 */
export function isActionSuccess<T>(
  result: SupabaseActionResult<T>
): result is SupabaseActionSuccess<T> {
  return 'success' in result && result.success === true;
}

// ============================================================================
// Scanner Error Types
// ============================================================================

/**
 * Different categories of scanner errors
 */
export type ScannerErrorType =
  | 'camera'      // Camera access or hardware issues
  | 'network'     // Network connectivity issues
  | 'processing'  // Barcode processing/decoding issues
  | 'permission'  // Permission denied by user
  | null;         // No error

/**
 * Detailed scanner error information
 */
export interface ScannerError {
  type: ScannerErrorType;
  message: string;
  details?: string;
}

// ============================================================================
// Form Validation Errors
// ============================================================================

/**
 * Validation error for a specific form field
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Collection of validation errors for a form
 */
export interface ValidationErrors {
  errors: FieldError[];
}

/**
 * Helper to create a validation error result
 */
export function createValidationError(field: string, message: string): SupabaseActionError {
  return {
    error: message,
    code: 'VALIDATION_ERROR',
    details: { field },
  };
}

// ============================================================================
// Common Error Codes
// ============================================================================

/**
 * Standard error codes used throughout the application
 */
export const ERROR_CODES = {
  // Authentication
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Database
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  FOREIGN_KEY_VIOLATION: 'FOREIGN_KEY_VIOLATION',

  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Business Logic
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  CATEGORY_HAS_PRODUCTS: 'CATEGORY_HAS_PRODUCTS',

  // Unknown
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// ============================================================================
// Error Factory Functions
// ============================================================================

/**
 * Creates a standardized error response
 * @param message - The error message
 * @param code - Optional error code
 * @param details - Optional additional details
 */
export function createError(
  message: string,
  code?: ErrorCode,
  details?: unknown
): SupabaseActionError {
  return {
    error: message,
    code,
    details,
  };
}

/**
 * Creates a "not authenticated" error
 */
export function createAuthError(): SupabaseActionError {
  return createError('No autenticado', ERROR_CODES.NOT_AUTHENTICATED);
}

/**
 * Creates a "not found" error
 * @param entity - The entity that was not found (e.g., "Producto", "Categoría")
 */
export function createNotFoundError(entity: string): SupabaseActionError {
  return createError(`${entity} no encontrado`, ERROR_CODES.NOT_FOUND);
}

/**
 * Creates a "duplicate entry" error
 * @param field - The field that has a duplicate value
 */
export function createDuplicateError(field: string): SupabaseActionError {
  return createError(
    `Ya existe un registro con este ${field}`,
    ERROR_CODES.DUPLICATE_ENTRY,
    { field }
  );
}
