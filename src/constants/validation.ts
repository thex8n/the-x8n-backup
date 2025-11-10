/**
 * Validation Messages for The X8N Application
 * Centralizes all validation error messages for consistency
 */

// ============================================================================
// Authentication Messages
// ============================================================================

export const AUTH_MESSAGES = {
  NOT_AUTHENTICATED: 'No autenticado',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
  EMAIL_REQUIRED: 'El correo electrónico es requerido',
  PASSWORD_REQUIRED: 'La contraseña es requerida',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
  NAME_REQUIRED: 'El nombre completo es requerido',
} as const;

// ============================================================================
// Product Validation Messages
// ============================================================================

export const PRODUCT_MESSAGES = {
  NAME_REQUIRED: 'El nombre del producto es requerido',
  NAME_TOO_SHORT: 'El nombre debe tener al menos 2 caracteres',
  CODE_DUPLICATE: 'Ya tienes un producto con este código. Por favor usa otro código.',
  CODE_OR_BARCODE_REQUIRED: 'Debes ingresar al menos un Código Único o un Código de Barra',
  STOCK_NEGATIVE: 'El stock no puede ser negativo',
  STOCK_MINIMUM_NEGATIVE: 'El stock mínimo no puede ser negativo',
  PRICE_NEGATIVE: 'El precio no puede ser negativo',
  COST_NEGATIVE: 'El costo no puede ser negativo',
  UNIT_REQUIRED: 'La unidad de medida es requerida',
  NOT_FOUND: 'Producto no encontrado',
  BARCODE_NOT_FOUND: 'No se encontró ningún producto con este código de barras',
} as const;

/**
 * Generates a stock insufficient error message
 * @param available - Available stock quantity
 * @param requested - Requested stock quantity
 */
export function getInsufficientStockMessage(available: number, requested: number): string {
  return `Stock insuficiente. Disponible: ${available}, Solicitado: ${requested}`;
}

// ============================================================================
// Category Validation Messages
// ============================================================================

export const CATEGORY_MESSAGES = {
  NAME_REQUIRED: 'El nombre de la categoría es requerido',
  NAME_TOO_SHORT: 'El nombre debe tener al menos 2 caracteres',
  COLOR_REQUIRED: 'El color es requerido',
  EMOJI_REQUIRED: 'El emoji es requerido',
  NOT_FOUND: 'Categoría no encontrada',
} as const;

/**
 * Generates a category deletion error message when products are assigned
 * @param count - Number of products assigned to the category
 */
export function getCategoryDeleteWithProductsMessage(count: number): string {
  return `No se puede eliminar la categoría porque tiene ${count} producto(s) asignado(s)`;
}

// ============================================================================
// Scanner Messages
// ============================================================================

export const SCANNER_MESSAGES = {
  CAMERA_PERMISSION_DENIED: 'Permiso de cámara denegado. Por favor habilítalo en la configuración.',
  CAMERA_NOT_FOUND: 'No se encontró ninguna cámara disponible',
  CAMERA_IN_USE: 'La cámara está siendo utilizada por otra aplicación',
  CAMERA_ERROR: 'Error al acceder a la cámara',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  PROCESSING_ERROR: 'Error al procesar el código de barras',
  SCAN_SUCCESS: 'Código escaneado exitosamente',
  SCAN_DUPLICATE: 'Este código ya fue escaneado recientemente',
} as const;

// ============================================================================
// General Error Messages
// ============================================================================

export const GENERAL_MESSAGES = {
  UNEXPECTED_ERROR: 'Error inesperado. Por favor intenta nuevamente.',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_FORMAT: 'Formato inválido',
  SAVE_SUCCESS: 'Guardado exitosamente',
  DELETE_SUCCESS: 'Eliminado exitosamente',
  UPDATE_SUCCESS: 'Actualizado exitosamente',
  OPERATION_CANCELLED: 'Operación cancelada',
} as const;

// ============================================================================
// POS Messages
// ============================================================================

export const POS_MESSAGES = {
  CART_EMPTY: 'El carrito está vacío',
  CHECKOUT_SUCCESS: 'Venta realizada exitosamente',
  CHECKOUT_ERROR: 'Error al procesar la venta',
  PRODUCT_ADDED: 'Producto agregado al carrito',
  PRODUCT_REMOVED: 'Producto eliminado del carrito',
  STOCK_UPDATED: 'Stock actualizado correctamente',
  STOCK_LIMIT_REACHED: 'Stock máximo alcanzado',
  CONFIRM_EXIT_TITLE: '¿Cerrar terminal de ventas?',
  CART_HAS_PRODUCTS: 'Tienes productos en el carrito',
  PRODUCT_NOT_FOUND: 'Producto no encontrado',
} as const;

/**
 * Generates a stock limit message for POS
 * @param productName - Name of the product
 * @param available - Available stock quantity
 */
export function getPOSStockLimitMessage(productName: string, available: number): string {
  return `Stock máximo alcanzado: ${productName} (${available} ${available === 1 ? 'unidad disponible' : 'unidades disponibles'})`;
}

/**
 * Generates a product added message for POS
 * @param productName - Name of the product
 * @param inCart - Quantity in cart
 * @param available - Available stock quantity
 */
export function getPOSProductAddedMessage(productName: string, inCart: number, available: number): string {
  return `${productName} agregado (${inCart}/${available} disponibles)`;
}

/**
 * Generates a cart summary message for exit confirmation
 * @param itemCount - Number of items in cart
 * @param total - Total amount
 */
export function getPOSCartSummaryMessage(itemCount: number, total: number): string {
  return `Tienes ${itemCount} ${itemCount === 1 ? 'producto' : 'productos'} en el carrito por un total de $${total.toLocaleString()}.`;
}
