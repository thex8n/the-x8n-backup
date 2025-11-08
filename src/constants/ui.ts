/**
 * UI Constants for The X8N Application
 * Centralizes all UI-related constants for consistency and easy maintenance
 */

// ============================================================================
// Scanner Configuration
// ============================================================================

/**
 * Minimum time (in milliseconds) between consecutive barcode scans
 * Prevents duplicate scans of the same barcode
 */
export const SCAN_COOLDOWN_MS = 500;

/**
 * Frames per second for barcode scanner camera feed
 * Lower values reduce CPU usage but may miss quick scans
 */
export const SCANNER_FPS = 10;

/**
 * Scanner detection box dimensions (in pixels)
 * Defines the area where barcodes are detected
 */
export const SCANNER_BOX_SIZE = {
  width: 250,
  height: 250,
} as const;

// ============================================================================
// Pagination Settings
// ============================================================================

/**
 * Default number of items to display per page in lists
 */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Available options for items per page selection
 */
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// ============================================================================
// Validation Constants
// ============================================================================

/**
 * Minimum length for product name input
 */
export const MIN_PRODUCT_NAME_LENGTH = 2;

/**
 * Minimum length for category name input
 */
export const MIN_CATEGORY_NAME_LENGTH = 2;

/**
 * Minimum password length for user registration
 */
export const MIN_PASSWORD_LENGTH = 8;

// ============================================================================
// Category Configuration
// ============================================================================

/**
 * Default color for new categories (gray)
 */
export const DEFAULT_CATEGORY_COLOR = '#6B7280';

/**
 * Available emoji options for category icons
 * Commonly used emojis for product categorization
 */
export const EMOJI_OPTIONS = [
  '📦', // Box/Package
  '🛒', // Shopping Cart
  '👕', // Clothing
  '💻', // Electronics
  '🏠', // Home
  '🍎', // Food
  '💊', // Pharmacy
  '🔧', // Tools
  '📱', // Mobile
  '🎮', // Gaming
  '🍔', // Fast Food
  '⚡', // Energy/Electric
  '🎨', // Art/Design
  '📚', // Books/Education
  '🏃', // Sports
] as const;

/**
 * Predefined color palette for categories
 * Colors follow Tailwind CSS color scheme
 */
export const COLOR_PRESETS = [
  '#6B7280', // Gray
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
] as const;

// ============================================================================
// Animation Durations (in milliseconds)
// ============================================================================

/**
 * Duration for modal open/close animations
 */
export const MODAL_ANIMATION_DURATION = 200;

/**
 * Duration for toast notification display
 */
export const TOAST_DURATION = 3000;

/**
 * Duration for success feedback animations
 */
export const SUCCESS_ANIMATION_DURATION = 1000;

// ============================================================================
// Breakpoints (matches Tailwind CSS defaults)
// ============================================================================

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ============================================================================
// Currency Configuration
// ============================================================================

/**
 * Locale for currency formatting
 */
export const CURRENCY_LOCALE = 'es-CO';

/**
 * Currency code for price formatting
 */
export const CURRENCY_CODE = 'COP';

/**
 * Number of decimal places for currency display
 */
export const CURRENCY_DECIMALS = 0;
