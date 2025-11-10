import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'

// ✅ Validar variables de entorno al inicio
if (!process.env.R2_ACCOUNT_ID) {
  throw new Error('❌ R2_ACCOUNT_ID no está configurado')
}
if (!process.env.R2_ACCESS_KEY_ID) {
  throw new Error('❌ R2_ACCESS_KEY_ID no está configurado')
}
if (!process.env.R2_SECRET_ACCESS_KEY) {
  throw new Error('❌ R2_SECRET_ACCESS_KEY no está configurado')
}
if (!process.env.R2_BUCKET_NAME) {
  throw new Error('❌ R2_BUCKET_NAME no está configurado')
}
if (!process.env.NEXT_PUBLIC_R2_PUBLIC_URL) {
  throw new Error('❌ NEXT_PUBLIC_R2_PUBLIC_URL no está configurado')
}

// Configurar cliente S3 para Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

/**
 * Sube un archivo a Cloudflare R2
 * @param file - Archivo a subir
 * @param key - Ruta/nombre del archivo en R2 (ej: "products/user123/imagen.jpg")
 * @returns URL pública del archivo
 */
export async function uploadToR2(
  file: File,
  key: string
): Promise<string> {
  try {
    console.log('📤 Subiendo archivo a R2:', key)
    console.log('🔗 R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME)
    console.log('🔗 NEXT_PUBLIC_R2_PUBLIC_URL:', process.env.NEXT_PUBLIC_R2_PUBLIC_URL)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        // ✅ Añadir metadata para debugging
        Metadata: {
          'uploaded-at': new Date().toISOString(),
          'original-name': file.name,
        },
      })
    )

    // ✅ Construir URL pública con validación
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`
    
    console.log('✅ Archivo subido exitosamente')
    console.log('📍 URL pública:', publicUrl)

    return publicUrl
  } catch (error) {
    console.error('❌ Error uploading to R2:', error)
    throw new Error('Failed to upload file to R2')
  }
}

/**
 * Elimina un archivo de Cloudflare R2
 * @param key - Ruta/nombre del archivo en R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    console.log('🗑️ Eliminando archivo de R2:', key)

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      })
    )

    console.log('✅ Archivo eliminado exitosamente')
  } catch (error) {
    console.error('❌ Error deleting from R2:', error)
    throw new Error('Failed to delete file from R2')
  }
}

/**
 * Extrae la key (ruta) desde una URL pública de R2
 * @param url - URL pública del archivo
 * @returns Key del archivo (ej: "products/user123/imagen.jpg")
 */
export function getKeyFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // Remover el "/" inicial del pathname
    const key = urlObj.pathname.substring(1)
    
    console.log('🔑 Key extraída de URL:', key)
    
    return key
  } catch (error) {
    console.error('❌ Error parsing URL:', error)
    throw new Error('Invalid URL format')
  }
}