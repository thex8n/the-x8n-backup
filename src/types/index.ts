/**
 * Central export point for all TypeScript types
 * Import types from this file for better organization and easier refactoring
 *
 * @example
 * ```typescript
 * import { Product, Category, ScannerConfig } from '@/types';
 * ```
 */

// ============================================================================
// Product Types
// ============================================================================

export type {
  Product,
  ProductFormData,
  ProductWithCategory,
} from './product';

// ============================================================================
// Category Types
// ============================================================================

export type {
  Category,
  CategoryFormData,
  CategoryWithProductCount,
} from './category';

// ============================================================================
// Cart Types
// ============================================================================

export type {
  CartItem,
  Cart,
} from './cart';

// ============================================================================
// Error Types
// ============================================================================

export type {
  SupabaseActionError,
  SupabaseActionSuccess,
  SupabaseActionResult,
  ScannerErrorType,
  ScannerError,
  FieldError,
  ValidationErrors,
  ErrorCode,
} from './errors';

export {
  isActionError,
  isActionSuccess,
  createValidationError,
  ERROR_CODES,
  createError,
  createAuthError,
  createNotFoundError,
  createDuplicateError,
} from './errors';

// ============================================================================
// Common Types
// ============================================================================

export type {
  SelectOption,
  LoadingState,
  AsyncState,
  PaginationState,
  PaginationResult,
  FilterState,
  SearchFilterConfig,
  ModalProps,
  ConfirmResult,
  FormState,
  ValidationResult,
  DateRange,
  TimestampFields,
  Breakpoint,
  ColorVariant,
  SizeVariant,
  Action,
  Callback,
  CallbackWithArg,
  DeepPartial,
  RequireKeys,
  OptionalKeys,
  ArrayElement,
} from './common';

// ============================================================================
// Scanner Types
// ============================================================================

export type {
  ScannerState,
  ScannerMode,
  ScannerConfig,
  ScanResult,
  ScannerResult,
  OnScanCallback,
  OnProductNotFoundCallback,
  OnScannerErrorCallback,
  OnScannerStateChangeCallback,
  ScannerHook,
  CameraDevice,
  CameraPermission,
  CameraInitResult,
  ScannerFeedback,
  ScannerStats,
} from './scanner';

export { DEFAULT_SCANNER_CONFIG } from './scanner';
