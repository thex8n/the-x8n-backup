'use server'

import { uploadToR2, deleteFromR2, getKeyFromUrl } from '@/lib/r2/client'
import { createClient } from '@/lib/supabase/server'

// Tipos de imagen permitidos
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Tamaño máximo: 2MB (después de compresión en cliente, las imágenes serán ~1MB o menos)
const MAX_FILE_SIZE = 2 * 1024 * 1024

interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

interface DeleteResult {
  success: boolean
  error?: string
}

/**
 * Sube una imagen de producto a Cloudflare R2
 * @param formData - FormData con el archivo en el campo 'file'
 * @returns Resultado con URL pública si es exitoso
 */
export async function uploadProductImage(
  formData: FormData
): Promise<UploadResult> {
  try {
    // Verificar autenticación
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    // Obtener archivo
    const file = formData.get('file') as File

    if (!file || file.size === 0) {
      return { success: false, error: 'No se proporcionó archivo' }
    }

    // Validar tipo de archivo
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Formato no permitido. Solo JPG, PNG y WebP',
      }
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'Imagen muy grande. Máximo 2MB (ya debería estar comprimida)',
      }
    }

    // Generar nombre único para el archivo
    // Formato: products/{user_id}/{timestamp}-{random}.{extension}
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const key = `products/${user.id}/${timestamp}-${random}.${extension}`

    // Subir a R2
    const url = await uploadToR2(file, key)

    return { success: true, url }
  } catch (error) {
    console.error('Error uploading product image:', error)
    return {
      success: false,
      error: 'Error al subir imagen. Intenta de nuevo.',
    }
  }
}

/**
 * Elimina una imagen de producto de Cloudflare R2
 * @param imageUrl - URL pública de la imagen a eliminar
 * @returns Resultado de la operación
 */
export async function deleteProductImage(
  imageUrl: string
): Promise<DeleteResult> {
  try {
    // Verificar autenticación
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    if (!imageUrl) {
      return { success: false, error: 'URL de imagen no proporcionada' }
    }

    // Extraer la key desde la URL
    const key = getKeyFromUrl(imageUrl)

    // Verificar que la imagen pertenece al usuario
    // La key debe empezar con "products/{user_id}/"
    if (!key.startsWith(`products/${user.id}/`)) {
      return {
        success: false,
        error: 'No tienes permiso para eliminar esta imagen',
      }
    }

    // Eliminar de R2
    await deleteFromR2(key)

    return { success: true }
  } catch (error) {
    console.error('Error deleting product image:', error)
    return {
      success: false,
      error: 'Error al eliminar imagen. Intenta de nuevo.',
    }
  }
}
