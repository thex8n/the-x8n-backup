'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth'
import { ProductFormData } from '@/types/product'
import { revalidatePath } from 'next/cache'
import { AUTH_MESSAGES, PRODUCT_MESSAGES } from '@/constants/validation'

/**
 * Adds a new product to the inventory
 * @param data - Product form data
 * @returns Success with product data or error message
 */
export async function addProduct(data: ProductFormData) {
  const user = await requireAuth()

  if (!user) {
    return { error: AUTH_MESSAGES.NOT_AUTHENTICATED }
  }

  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      user_id: user.id,
      name: data.name,
      code: data.code,
      barcode: data.barcode || null,  // ✅ NUEVO: Guardar barcode
      category_id: data.category_id || null,
      stock_quantity: data.stock_quantity,
      minimum_stock: data.minimum_stock,
      sale_price: data.sale_price || null,
      cost_price: data.cost_price || null,
      unit_of_measure: data.unit_of_measure || null,
      active: data.active,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding product:', error)
    if (error.code === '23505') {
      return { error: PRODUCT_MESSAGES.CODE_DUPLICATE }
    }
    return { error: error.message }
  }

  revalidatePath('/inventory')
  return { success: true, data: product }
}

/**
 * Retrieves all products for the authenticated user
 * @returns Success with products array or error message
 */
export async function getProducts() {
  const user = await requireAuth()

  if (!user) {
    return { error: AUTH_MESSAGES.NOT_AUTHENTICATED }
  }

  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, color, icon)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return { error: error.message }
  }

  return { success: true, data: products }
}

/**
 * Updates an existing product
 * @param productId - ID of the product to update
 * @param data - Updated product form data
 * @returns Success with updated product data or error message
 */
export async function updateProduct(productId: string, data: ProductFormData) {
  const user = await requireAuth()

  if (!user) {
    return { error: AUTH_MESSAGES.NOT_AUTHENTICATED }
  }

  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .update({
      name: data.name,
      code: data.code,
      barcode: data.barcode || null,  // ✅ NUEVO: Actualizar barcode
      category_id: data.category_id || null,
      stock_quantity: data.stock_quantity,
      minimum_stock: data.minimum_stock,
      sale_price: data.sale_price || null,
      cost_price: data.cost_price || null,
      unit_of_measure: data.unit_of_measure || null,
      active: data.active,
    })
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    if (error.code === '23505') {
      return { error: PRODUCT_MESSAGES.CODE_DUPLICATE }
    }
    return { error: error.message }
  }

  revalidatePath('/inventory')
  return { success: true, data: product }
}

/**
 * Deletes a product from the inventory
 * @param productId - ID of the product to delete
 * @returns Success or error message
 */
export async function deleteProduct(productId: string) {
  const user = await requireAuth()

  if (!user) {
    return { error: AUTH_MESSAGES.NOT_AUTHENTICATED }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) {
    console.error('Error deleting product:', error)
    return { error: error.message }
  }

  revalidatePath('/inventory')
  return { success: true }
}

/**
 * Searches products by name or code
 * @param query - Search query string
 * @returns Success with matching products or error message
 */
export async function searchProducts(query: string) {
  const user = await requireAuth()

  if (!user) {
    return { error: AUTH_MESSAGES.NOT_AUTHENTICATED }
  }

  if (!query.trim()) {
    return getProducts()
  }

  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching products:', error)
    return { error: error.message }
  }

  return { success: true, data: products }
}

/**
 * Finds a product by its unique code
 * @param code - Product code to search for
 * @returns Success with product data (or null if not found) or error message
 */
export async function findProductByCode(code: string) {
  const user = await requireAuth()

  if (!user) {
    return { error: AUTH_MESSAGES.NOT_AUTHENTICATED }
  }

  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, color, icon)
    `)
    .eq('code', code)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return { success: true, data: null }
    }
    console.error('Error finding product:', error)
    return { error: error.message }
  }

  return { success: true, data: product }
}

/**
 * Finds a product by its barcode
 * Uses maybeSingle() to return null if not found instead of throwing error
 * @param barcode - Barcode to search for
 * @returns Success with product data (or null if not found) or error message
 */
export async function findProductByBarcode(barcode: string) {
  const user = await requireAuth()

  if (!user) {
    return { error: AUTH_MESSAGES.NOT_AUTHENTICATED }
  }

  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, color, icon)
    `)
    .eq('barcode', barcode)
    .eq('user_id', user.id)
    .maybeSingle()  // ✅ Usa maybeSingle en lugar de single para no lanzar error si no existe

  if (error) {
    console.error('Error finding product by barcode:', error)
    return { error: error.message }
  }

  return { success: true, data: product }
}

/**
 * Increments a product's stock quantity by 1
 * @param productId - ID of the product to increment
 * @returns Success with updated product data or error message
 */
export async function incrementProductStock(productId: string) {
  const user = await requireAuth()

  if (!user) {
    return { error: AUTH_MESSAGES.NOT_AUTHENTICATED }
  }

  const supabase = await createClient()

  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('stock_quantity')
    .eq('id', productId)
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    console.error('Error fetching product:', fetchError)
    return { error: fetchError.message }
  }

  const newStock = product.stock_quantity + 1

  const { data: updatedProduct, error: updateError } = await supabase
    .from('products')
    .update({ stock_quantity: newStock })
    .eq('id', productId)
    .select(`
      *,
      category:categories(id, name, color, icon)
    `)
    .single()

  if (updateError) {
    console.error('Error updating stock:', updateError)
    return { error: updateError.message }
  }

  revalidatePath('/inventory')
  return { success: true, data: updatedProduct }
}

/**
 * Decrements a product's stock quantity
 * Validates that sufficient stock is available before decrementing
 * @param productId - ID of the product to decrement
 * @param quantity - Amount to decrement (default: 1)
 * @returns Success with updated product data or error message
 */
export async function decrementProductStock(productId: string, quantity: number = 1) {
  const user = await requireAuth()

  if (!user) {
    return { error: AUTH_MESSAGES.NOT_AUTHENTICATED }
  }

  const supabase = await createClient()

  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('stock_quantity, name')
    .eq('id', productId)
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    console.error('Error fetching product:', fetchError)
    return { error: fetchError.message }
  }

  // Validar que haya stock suficiente
  if (product.stock_quantity < quantity) {
    const { getInsufficientStockMessage } = await import('@/constants/validation')
    return { error: getInsufficientStockMessage(product.stock_quantity, quantity) }
  }

  const newStock = product.stock_quantity - quantity

  const { data: updatedProduct, error: updateError } = await supabase
    .from('products')
    .update({ stock_quantity: newStock })
    .eq('id', productId)
    .select(`
      *,
      category:categories(id, name, color, icon)
    `)
    .single()

  if (updateError) {
    console.error('Error updating stock:', updateError)
    return { error: updateError.message }
  }

  revalidatePath('/inventory')
  revalidatePath('/pos')
  return { success: true, data: updatedProduct }
}