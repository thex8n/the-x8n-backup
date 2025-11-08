/**
 * Product-specific utility functions
 */

import type { Product, ProductWithCategory } from '@/types';

// ============================================================================
// Product Code Generation
// ============================================================================

/**
 * Generates the next sequential product code in PROD-XXX format
 *
 * This function:
 * 1. Finds all existing products with PROD-XXX format codes
 * 2. Extracts the numeric portion and finds the highest number
 * 3. Increments by 1 and returns a zero-padded code
 *
 * @param products - Array of all products to analyze
 * @returns Next sequential product code (e.g., "PROD-001", "PROD-042")
 *
 * @example
 * ```typescript
 * // If existing codes are: PROD-001, PROD-002, PROD-005
 * generateNextProductCode(products)  // Returns "PROD-006"
 *
 * // If no products exist
 * generateNextProductCode([])  // Returns "PROD-001"
 * ```
 */
export function generateNextProductCode(products: Product[]): string {
  // Filter products that have codes with PROD-XXX format
  const prodCodes = products
    .map((p) => p.code)
    .filter((code) => code.startsWith('PROD-'))
    .map((code) => {
      const num = parseInt(code.replace('PROD-', ''));
      return isNaN(num) ? 0 : num;
    });

  // Find the highest number and add 1
  const maxNum = prodCodes.length > 0 ? Math.max(...prodCodes) : 0;
  const nextNum = maxNum + 1;

  // Return zero-padded code (minimum 3 digits)
  return `PROD-${String(nextNum).padStart(3, '0')}`;
}

/**
 * Validates if a product code follows the PROD-XXX format
 *
 * @param code - Product code to validate
 * @returns true if code is in PROD-XXX format
 *
 * @example
 * ```typescript
 * isValidProductCode('PROD-001')  // true
 * isValidProductCode('PROD-999')  // true
 * isValidProductCode('ABC-123')   // false
 * isValidProductCode('PROD-')     // false
 * ```
 */
export function isValidProductCode(code: string): boolean {
  return /^PROD-\d{3,}$/.test(code);
}

// ============================================================================
// Stock Utilities
// ============================================================================

/**
 * Checks if a product has low stock based on its minimum stock threshold
 *
 * @param product - Product to check
 * @returns true if stock is at or below minimum threshold
 *
 * @example
 * ```typescript
 * isLowStock({ stock_quantity: 5, minimum_stock: 10 })  // true
 * isLowStock({ stock_quantity: 15, minimum_stock: 10 }) // false
 * ```
 */
export function isLowStock(product: Product): boolean {
  return product.stock_quantity <= product.minimum_stock && product.stock_quantity > 0;
}

/**
 * Checks if a product is out of stock
 *
 * @param product - Product to check
 * @returns true if stock quantity is 0
 */
export function isOutOfStock(product: Product): boolean {
  return product.stock_quantity === 0;
}

/**
 * Calculates the total value of a product's inventory
 * Uses cost_price if available, otherwise uses sale_price
 *
 * @param product - Product to calculate value for
 * @returns Total inventory value (quantity × price) or 0 if no price available
 *
 * @example
 * ```typescript
 * calculateStockValue({
 *   stock_quantity: 10,
 *   cost_price: 5000,
 *   sale_price: 8000
 * })  // Returns 50000 (uses cost_price)
 *
 * calculateStockValue({
 *   stock_quantity: 10,
 *   cost_price: null,
 *   sale_price: 8000
 * })  // Returns 80000 (falls back to sale_price)
 * ```
 */
export function calculateStockValue(product: Product): number {
  const price = product.cost_price ?? product.sale_price ?? 0;
  return product.stock_quantity * price;
}

/**
 * Calculates the total inventory value for multiple products
 *
 * @param products - Array of products
 * @returns Total inventory value across all products
 */
export function calculateTotalInventoryValue(products: Product[]): number {
  return products.reduce((total, product) => {
    return total + calculateStockValue(product);
  }, 0);
}

/**
 * Calculates profit margin percentage for a product
 *
 * @param product - Product to calculate margin for
 * @returns Profit margin percentage (0-100) or null if prices unavailable
 *
 * @example
 * ```typescript
 * calculateProfitMargin({
 *   cost_price: 5000,
 *   sale_price: 8000
 * })  // Returns 37.5 (37.5% margin)
 * ```
 */
export function calculateProfitMargin(product: Product): number | null {
  if (!product.cost_price || !product.sale_price) return null;

  const margin = ((product.sale_price - product.cost_price) / product.sale_price) * 100;
  return Math.round(margin * 100) / 100; // Round to 2 decimal places
}

// ============================================================================
// Product Filtering and Searching
// ============================================================================

/**
 * Searches products by name, code, or barcode
 * Case-insensitive search
 *
 * @param products - Array of products to search
 * @param searchTerm - Search term to match against
 * @returns Filtered array of matching products
 *
 * @example
 * ```typescript
 * searchProducts(allProducts, 'laptop')
 * // Returns products with "laptop" in name, code, or barcode
 * ```
 */
export function searchProducts(
  products: ProductWithCategory[],
  searchTerm: string
): ProductWithCategory[] {
  if (!searchTerm.trim()) return products;

  const term = searchTerm.toLowerCase();

  return products.filter((product) => {
    return (
      product.name.toLowerCase().includes(term) ||
      product.code.toLowerCase().includes(term) ||
      (product.barcode && product.barcode.toLowerCase().includes(term))
    );
  });
}

/**
 * Filters products by category
 *
 * @param products - Array of products to filter
 * @param categoryId - Category ID to filter by (null for uncategorized)
 * @returns Filtered array of products
 */
export function filterByCategory(
  products: ProductWithCategory[],
  categoryId: string | null
): ProductWithCategory[] {
  return products.filter((product) => product.category_id === categoryId);
}

/**
 * Filters products by active status
 *
 * @param products - Array of products to filter
 * @param activeOnly - If true, return only active products
 * @returns Filtered array of products
 */
export function filterByActiveStatus(
  products: Product[],
  activeOnly = true
): Product[] {
  if (!activeOnly) return products;
  return products.filter((product) => product.active);
}

// ============================================================================
// Product Statistics
// ============================================================================

/**
 * Calculates product statistics for dashboard/overview
 *
 * @param products - Array of products to analyze
 * @returns Statistics object with counts and values
 */
export function calculateProductStats(products: Product[]) {
  const activeProducts = products.filter((p) => p.active);
  const lowStockProducts = activeProducts.filter(isLowStock);
  const outOfStockProducts = activeProducts.filter(isOutOfStock);
  const totalValue = calculateTotalInventoryValue(activeProducts);

  return {
    total: activeProducts.length,
    lowStock: lowStockProducts.length,
    outOfStock: outOfStockProducts.length,
    totalValue,
  };
}

// ============================================================================
// Product Sorting
// ============================================================================

/**
 * Sort direction type
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Available sort fields for products
 */
export type ProductSortField =
  | 'name'
  | 'code'
  | 'stock_quantity'
  | 'sale_price'
  | 'cost_price'
  | 'created_at';

/**
 * Sorts products by specified field and direction
 *
 * @param products - Array of products to sort
 * @param field - Field to sort by
 * @param direction - Sort direction ('asc' or 'desc')
 * @returns Sorted array of products (creates new array)
 */
export function sortProducts(
  products: Product[],
  field: ProductSortField,
  direction: SortDirection = 'asc'
): Product[] {
  const sortedProducts = [...products];
  const multiplier = direction === 'asc' ? 1 : -1;

  sortedProducts.sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];

    // Handle null values
    if (aValue === null) return 1 * multiplier;
    if (bValue === null) return -1 * multiplier;

    // String comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * multiplier;
    }

    // Number comparison
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * multiplier;
    }

    return 0;
  });

  return sortedProducts;
}
