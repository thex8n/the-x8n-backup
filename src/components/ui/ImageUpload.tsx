'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { uploadProductImage, deleteProductImage } from '@/app/actions/upload'
import toast from 'react-hot-toast'
import imageCompression from 'browser-image-compression'

interface ImageUploadProps {
  currentImageUrl?: string | null
  onImageChange: (url: string | null) => void
  onImageRemove?: () => void
}

export default function ImageUpload({
  currentImageUrl,
  onImageChange,
  onImageRemove,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null
  )
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validación de tipo en cliente
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen')
      return
    }

    // Validación de tamaño en cliente (10MB antes de comprimir)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen es muy grande. Máximo 10MB')
      return
    }

    setUploading(true)

    try {
      // Comprimir imagen
      const toastId = toast.loading('Comprimiendo imagen...')

      const options = {
        maxSizeMB: 1,           // Máximo 1MB después de comprimir
        maxWidthOrHeight: 1920, // Máximo 1920px de ancho o alto
        useWebWorker: true,     // Usar Web Worker para no bloquear UI
        fileType: 'image/webp', // Convertir a WebP para mejor compresión
        initialQuality: 0.8,    // 80% de calidad (imperceptible)
      }

      const compressedFile = await imageCompression(file, options)

      // Log de estadísticas de compresión
      const originalSizeMB = (file.size / 1024 / 1024).toFixed(2)
      const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2)
      const savings = ((1 - compressedFile.size / file.size) * 100).toFixed(1)

      console.log('📊 Compresión de imagen:')
      console.log(`   Original: ${originalSizeMB} MB`)
      console.log(`   Comprimida: ${compressedSizeMB} MB`)
      console.log(`   Ahorro: ${savings}%`)

      toast.dismiss(toastId)

      // Mostrar preview local de la imagen comprimida
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(compressedFile)

      // Subir imagen comprimida a R2
      const formData = new FormData()
      formData.append('file', compressedFile, compressedFile.name)

      const result = await uploadProductImage(formData)

      if (result.success && result.url) {
        onImageChange(result.url)
        toast.success(`Imagen optimizada y subida (${savings}% más pequeña)`)
      } else {
        toast.error(result.error || 'Error al subir imagen')
        // Restaurar preview anterior si falla
        setPreview(currentImageUrl || null)
        // Limpiar input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      console.error('Error processing image:', error)
      toast.error('Error al procesar imagen')
      setPreview(currentImageUrl || null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    // Si hay una URL actual, intentar eliminarla de R2
    if (currentImageUrl) {
      try {
        const result = await deleteProductImage(currentImageUrl)
        if (result.success) {
          toast.success('Imagen eliminada')
        } else {
          toast.error(result.error || 'Error al eliminar imagen')
          return // No continuar si falla la eliminación
        }
      } catch (error) {
        console.error('Error deleting image:', error)
        toast.error('Error al eliminar imagen')
        return
      }
    }

    setPreview(null)
    onImageChange(null)
    onImageRemove?.()

    // Limpiar input file
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Imagen del Producto
      </label>

      {preview ? (
        <div className="relative w-full h-64 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden group">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain"
            unoptimized={preview.startsWith('data:')}
          />

          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="flex items-center gap-2 text-white">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Subiendo...</span>
              </div>
            </div>
          )}

          {!uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Eliminar imagen"
            >
              <X size={20} />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Subiendo imagen...
                </p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click para subir</span> o
                  arrastra y suelta
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  JPG, PNG o WebP (MAX. 10MB)
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Se comprimirá automáticamente a WebP
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {uploading && (
        <p className="text-sm text-blue-600 dark:text-blue-400">
          Subiendo imagen a Cloudflare R2...
        </p>
      )}
    </div>
  )
}
