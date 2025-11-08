/**
 * Scanner-specific types for barcode scanning functionality
 */

import type { ScannerError, ScannerErrorType } from './errors';

// ============================================================================
// Scanner State Types
// ============================================================================

/**
 * Current state of the barcode scanner
 */
export type ScannerState =
  | 'idle'        // Scanner not started
  | 'scanning'    // Actively scanning for barcodes
  | 'processing'  // Processing a scanned barcode
  | 'paused'      // Scanner paused (e.g., during cooldown)
  | 'error';      // Scanner encountered an error

/**
 * Scanner mode for different use cases
 */
export type ScannerMode =
  | 'inventory'   // Inventory management scanning
  | 'pos'         // Point of sale scanning
  | 'stock';      // Stock increment scanning

// ============================================================================
// Scanner Configuration
// ============================================================================

/**
 * Configuration options for barcode scanner
 */
export interface ScannerConfig {
  /**
   * Frames per second for camera feed
   * Lower values reduce CPU usage
   */
  fps: number;

  /**
   * Cooldown period between scans (milliseconds)
   * Prevents duplicate scans
   */
  cooldownMs: number;

  /**
   * Detection box dimensions
   */
  boxSize: {
    width: number;
    height: number;
  };

  /**
   * Whether to use vibration feedback on successful scan
   */
  enableVibration?: boolean;

  /**
   * Whether to play sound on successful scan
   */
  enableSound?: boolean;

  /**
   * Preferred camera facing mode
   */
  facingMode?: 'user' | 'environment';
}

/**
 * Default scanner configuration
 */
export const DEFAULT_SCANNER_CONFIG: ScannerConfig = {
  fps: 10,
  cooldownMs: 500,
  boxSize: { width: 250, height: 250 },
  enableVibration: true,
  enableSound: false,
  facingMode: 'environment',
};

// ============================================================================
// Scanner Result Types
// ============================================================================

/**
 * Result of a successful barcode scan
 */
export interface ScanResult {
  /**
   * The decoded barcode text
   */
  code: string;

  /**
   * Format of the barcode (e.g., 'QR_CODE', 'EAN_13')
   */
  format?: string;

  /**
   * Timestamp of when the scan occurred
   */
  timestamp: number;
}

/**
 * Scanner operation result
 */
export type ScannerResult =
  | { success: true; result: ScanResult }
  | { success: false; error: ScannerError };

// ============================================================================
// Scanner Callbacks
// ============================================================================

/**
 * Callback when a barcode is successfully scanned
 */
export type OnScanCallback = (code: string) => void | Promise<void>;

/**
 * Callback when a product is not found after scanning
 */
export type OnProductNotFoundCallback = (barcode: string) => void | Promise<void>;

/**
 * Callback when scanner encounters an error
 */
export type OnScannerErrorCallback = (error: ScannerError) => void;

/**
 * Callback when scanner state changes
 */
export type OnScannerStateChangeCallback = (state: ScannerState) => void;

// ============================================================================
// Scanner Hook Return Type
// ============================================================================

/**
 * Return type for barcode scanner custom hooks
 */
export interface ScannerHook {
  /**
   * Current state of the scanner
   */
  state: ScannerState;

  /**
   * Current error (if any)
   */
  error: ScannerError | null;

  /**
   * Last scanned code
   */
  scannedCode: string | null;

  /**
   * Whether scanner is currently active
   */
  isActive: boolean;

  /**
   * Whether scanner is in cooldown period
   */
  isInCooldown: boolean;

  /**
   * Start the scanner
   */
  startScanner: () => Promise<void>;

  /**
   * Stop the scanner
   */
  stopScanner: () => void;

  /**
   * Pause the scanner temporarily
   */
  pauseScanner: () => void;

  /**
   * Resume the scanner
   */
  resumeScanner: () => void;

  /**
   * Handle a scanned barcode
   */
  handleBarcodeScanned: (code: string) => Promise<void>;

  /**
   * Clear the current error
   */
  clearError: () => void;
}

// ============================================================================
// Camera Types
// ============================================================================

/**
 * Camera device information
 */
export interface CameraDevice {
  deviceId: string;
  label: string;
  facingMode?: 'user' | 'environment';
}

/**
 * Camera permission state
 */
export type CameraPermission = 'granted' | 'denied' | 'prompt' | 'unavailable';

/**
 * Camera initialization result
 */
export interface CameraInitResult {
  success: boolean;
  deviceId?: string;
  error?: ScannerError;
}

// ============================================================================
// Scanner Feedback Types
// ============================================================================

/**
 * Visual feedback for scanner UI
 */
export interface ScannerFeedback {
  /**
   * Show success animation
   */
  showSuccess: boolean;

  /**
   * Success message to display
   */
  successMessage?: string;

  /**
   * Show processing indicator
   */
  showProcessing: boolean;

  /**
   * Processing message to display
   */
  processingMessage?: string;
}

// ============================================================================
// Scanner Statistics
// ============================================================================

/**
 * Scanner usage statistics
 */
export interface ScannerStats {
  /**
   * Total number of successful scans
   */
  totalScans: number;

  /**
   * Number of failed scans
   */
  failedScans: number;

  /**
   * Average time per scan (milliseconds)
   */
  averageScanTime: number;

  /**
   * Last scan timestamp
   */
  lastScanTime?: number;
}

// ============================================================================
// Re-export Scanner Error Types
// ============================================================================

export type { ScannerError, ScannerErrorType };
