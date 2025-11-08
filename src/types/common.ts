/**
 * Common Types used across the application
 * Shared types that don't belong to a specific domain
 */

// ============================================================================
// UI Component Types
// ============================================================================

/**
 * Generic select/dropdown option
 */
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * Loading states for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Generic async operation state
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// Pagination Types
// ============================================================================

/**
 * Pagination state for lists and tables
 */
export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Pagination controls and data
 */
export interface PaginationResult<T> {
  items: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setItemsPerPage: (size: number) => void;
}

// ============================================================================
// Filter and Search Types
// ============================================================================

/**
 * Generic filter state
 */
export interface FilterState<T = string> {
  field: string;
  value: T;
  operator?: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte';
}

/**
 * Search and filter configuration
 */
export interface SearchFilterConfig {
  searchTerm: string;
  filters: FilterState[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// ============================================================================
// Modal Types
// ============================================================================

/**
 * Props for modal components
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

/**
 * Confirmation dialog result
 */
export type ConfirmResult = 'confirmed' | 'cancelled';

// ============================================================================
// Form Types
// ============================================================================

/**
 * Generic form state management
 */
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isDirty: boolean;
  isSubmitting: boolean;
}

/**
 * Form field validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// ============================================================================
// Date and Time Types
// ============================================================================

/**
 * Date range for filtering
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Timestamp fields present in database records
 */
export interface TimestampFields {
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// User Interface Types
// ============================================================================

/**
 * Responsive breakpoint keys
 */
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Common color variants for UI components
 */
export type ColorVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

/**
 * Size variants for components
 */
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// ============================================================================
// Action Types
// ============================================================================

/**
 * Generic action with payload
 */
export interface Action<T = unknown> {
  type: string;
  payload?: T;
}

/**
 * Callback function types
 */
export type Callback<T = void> = () => T;
export type CallbackWithArg<TArg, TReturn = void> = (arg: TArg) => TReturn;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Makes all properties of T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Makes specified keys required
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Makes specified keys optional
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Extracts the type of an array element
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;
