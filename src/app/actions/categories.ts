'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth'
import { CategoryFormData } from '@/types/category'
import { revalidatePath } from 'next/cache'
import { AUTH_MESSAGES, getCategoryDeleteWithProductsMessage } from '@/constants/validation'

/**
 * Adds a new category to the system
 * @param data - Category form data
 * @returns Success with category data or error message
 */
export async function addCategory(data: CategoryFormData) {
  const user = await requireAuth()

  if (!user) {
    return { error: AUTH_MESSAGES.NOT_AUTHENTICATED }
  }

  const supabase = await createClient()

  const { data: category, error } = await supabase
    .from('categories')
    .insert({
      user_id: user.id,
      name: data.name,
      description: data.description || null,
      parent_category_id: data.parent_category_id || null,
      color: data.color,
      icon: data.icon,
      active: data.active,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding category:', error)
    return { error: error.message }
  }

  revalidatePath('/inventory')
  return { success: true, data: category }
}

/**
 * Retrieves all categories for the authenticated user
 * @returns Success with categories array or error message
 */
export async function getCategories() {
  const user = await requireAuth()

  if (!user) {
    return { error: AUTH_MESSAGES.NOT_AUTHENTICATED }
  }

  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('order_index', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return { error: error.message }
  }

  return { success: true, data: categories }
}

/**
 * Updates an existing category
 * @param categoryId - ID of the category to update
 * @param data - Updated category form data
 * @returns Success with updated category data or error message
 */
export async function updateCategory(categoryId: string, data: CategoryFormData) {
  const user = await requireAuth()

  if (!user) {
    return { error: AUTH_MESSAGES.NOT_AUTHENTICATED }
  }

  const supabase = await createClient()

  const { data: category, error } = await supabase
    .from('categories')
    .update({
      name: data.name,
      description: data.description || null,
      parent_category_id: data.parent_category_id || null,
      color: data.color,
      icon: data.icon,
      active: data.active,
    })
    .eq('id', categoryId)
    .select()
    .single()

  if (error) {
    console.error('Error updating category:', error)
    return { error: error.message }
  }

  revalidatePath('/inventory')
  return { success: true, data: category }
}

/**
 * Deletes a category from the system
 * Validates that no products are assigned to the category before deletion
 * @param categoryId - ID of the category to delete
 * @returns Success or error message
 */
export async function deleteCategory(categoryId: string) {
  const user = await requireAuth()

  if (!user) {
    return { error: AUTH_MESSAGES.NOT_AUTHENTICATED }
  }

  const supabase = await createClient()

  // Check if category has products assigned
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId)

  if (countError) {
    console.error('Error checking products:', countError)
    return { error: countError.message }
  }

  if (count && count > 0) {
    return { error: getCategoryDeleteWithProductsMessage(count) }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    console.error('Error deleting category:', error)
    return { error: error.message }
  }

  revalidatePath('/inventory')
  return { success: true }
}
