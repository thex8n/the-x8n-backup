'use client'

import { X, Pencil, Camera, ImagePlus, Loader2, CheckCircle } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { uploadProductImage } from '@/app/actions/upload'
import { updateProductImage } from '@/app/actions/products'

interface ImageViewerProps {
  imageUrl: string
  productName: string
  productId?: string
  onClose: () => void
  onImageUpdate?: (newImageUrl: string) => void
  originRect?: DOMRect | null
}

export default function ImageViewer({ 
  imageUrl, 
  productName, 
  productId,
  onClose, 
  onImageUpdate,
  originRect 
}: ImageViewerProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [updated, setUpdated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentImage, setCurrentImage] = useState(imageUrl)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Bloquear scroll del body Y del contenedor main - GUARDANDO LA POSICIÓN
  useEffect(() => {
    const scrollY = window.scrollY
    const scrollX = window.scrollX
    
    document.body.style.overflow = 'hidden'
    
    const mainElement = document.querySelector('main')
    const htmlElement = document.documentElement
    
    if (mainElement) {
      mainElement.style.overflow = 'hidden'
    }
    
    htmlElement.style.overflow = 'hidden'
    htmlElement.style.position = 'fixed'
    htmlElement.style.width = '100%'
    htmlElement.style.height = '100%'
    htmlElement.style.top = `-${scrollY}px`
    htmlElement.style.left = `-${scrollX}px`
    
    return () => {
      document.body.style.overflow = 'unset'
      htmlElement.style.overflow = 'unset'
      htmlElement.style.position = 'static'
      htmlElement.style.width = 'auto'
      htmlElement.style.height = 'auto'
      htmlElement.style.top = '0'
      htmlElement.style.left = '0'
      
      if (mainElement) {
        mainElement.style.overflow = 'unset'
      }
      
      window.scrollTo(scrollX, scrollY)
    }
  }, [])

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showOptions) handleClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [showOptions])

  const handleClose = () => {
    if (uploading) return
    
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 220)
  }

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const img = new Image()
        
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('No se pudo crear contexto de canvas'))
            return
          }

          const SIZE = 800
          canvas.width = SIZE
          canvas.height = SIZE

          let sourceX = 0
          let sourceY = 0
          let sourceSize = Math.min(img.width, img.height)

          if (img.width > img.height) {
            sourceX = (img.width - img.height) / 2
          } else {
            sourceY = (img.height - img.width) / 2
          }

          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, SIZE, SIZE)

          ctx.drawImage(
            img,
            sourceX, sourceY, sourceSize, sourceSize,
            0, 0, SIZE, SIZE
          )

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], 'product.webp', {
                  type: 'image/webp',
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              } else {
                reject(new Error('Error al comprimir imagen'))
              }
            },
            'image/webp',
            0.85
          )
        }

        img.onerror = () => reject(new Error('Error al cargar imagen'))
        img.src = e.target?.result as string
      }

      reader.onerror = () => reject(new Error('Error al leer archivo'))
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !productId) return

    await processImage(file)
    setShowOptions(false)
  }

  const processImage = async (file: File) => {
    setError(null)
    setUploading(true)

    try {
      const compressedFile = await compressImage(file)
      
      const formData = new FormData()
      formData.append('file', compressedFile)

      const uploadResult = await uploadProductImage(formData)

      if (uploadResult.success && uploadResult.url) {
        const updateResult = await updateProductImage(productId!, uploadResult.url)
        
        if (updateResult.success) {
          setCurrentImage(uploadResult.url)
          setUpdated(true)
          
          if (onImageUpdate) {
            onImageUpdate(uploadResult.url)
          }
          
          setTimeout(() => {
            handleClose()
          }, 1500)
        } else {
          setError(updateResult.error || 'Error al actualizar producto')
        }
      } else {
        setError(uploadResult.error || 'Error al subir imagen')
      }
    } catch (err) {
      console.error('Error processing image:', err)
      setError('Error al procesar imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleTakePhoto = () => {
    cameraInputRef.current?.click()
  }

  const handleChooseFromGallery = () => {
    fileInputRef.current?.click()
  }

  const getImageStyle = () => {
    if (!originRect) return {}

    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    
    const centerX = windowWidth / 2
    const centerY = windowHeight / 2
    
    const originX = originRect.left + originRect.width / 2
    const originY = originRect.top + originRect.height / 2
    
    const thumbnailSize = 80
    const finalScale = thumbnailSize / Math.min(windowWidth, windowHeight)
    
    if (isClosing) {
      return {
        transform: `translate(${originX - centerX}px, ${originY - centerY}px) scale(${finalScale})`,
        transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease-out',
        opacity: 1
      }
    }
    
    return {
      transform: 'translate(0, 0) scale(1)',
      transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: originRect ? 'expandFromOrigin 0.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'fadeIn 0.15s ease-out'
    }
  }

  const getInitialTransform = () => {
    if (!originRect) return 'scale(0.95)'
    
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const centerX = windowWidth / 2
    const centerY = windowHeight / 2
    const originX = originRect.left + originRect.width / 2
    const originY = originRect.top + originRect.height / 2
    
    const thumbnailSize = 80
    const initialScale = thumbnailSize / Math.min(windowWidth, windowHeight)
    
    return `translate(${originX - centerX}px, ${originY - centerY}px) scale(${initialScale})`
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes expandFromOrigin {
          from {
            transform: ${getInitialTransform()};
          }
          to {
            transform: translate(0, 0) scale(1);
          }
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>

      <div 
        className="fixed inset-0 bg-black/90 z-110 overscroll-none touch-none"
        style={{
          opacity: isClosing ? 0 : 1,
          transition: 'opacity 0.15s ease-out'
        }}
        onClick={handleClose}
        onTouchMove={(e) => e.preventDefault()}
      />

      <div
        className="fixed inset-0 z-111 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <div
          className="relative max-w-4xl max-h-full"
          style={getImageStyle()}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            disabled={uploading}
            className="absolute -top-12 right-0 p-2 hover:bg-white/10 rounded-full transition-colors z-10 disabled:opacity-50"
            style={{
              opacity: isClosing ? 0 : 1,
              transition: 'opacity 0.15s ease-out'
            }}
            aria-label="Cerrar"
          >
            <X className="w-6 h-6 text-white" strokeWidth={2.5} />
          </button>

          {productId && (
            <button
              onClick={() => setShowOptions(true)}
              disabled={uploading || updated}
              className="md:hidden absolute -bottom-12 right-0 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                opacity: isClosing ? 0 : 1,
                transition: 'opacity 0.15s ease-out'
              }}
              aria-label="Editar imagen"
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 text-gray-700 animate-spin" />
              ) : updated ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <Pencil className="w-6 h-6 text-gray-700" />
              )}
            </button>
          )}

          <img 
            src={currentImage}
            alt={productName}
            className="w-full h-auto object-contain rounded-lg"
            style={{
              maxHeight: 'calc(100vh - 8rem)',
            }}
          />

          {updated && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">¡Actualizado!</span>
            </div>
          )}

          {error && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg max-w-xs text-center text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {showOptions && !uploading && !updated && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-112"
            onClick={() => setShowOptions(false)}
          />
          
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-113 animate-slideUp shadow-2xl">
            <div className="flex justify-center pt-2 pb-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            <div className="px-2 pb-6">
              <div className="grid grid-cols-2 gap-4 px-4">
                <button
                  type="button"
                  onClick={handleTakePhoto}
                  className="flex flex-col items-center gap-2 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Camera className="w-6 h-6 text-gray-700" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Foto</span>
                </button>

                <button
                  type="button"
                  onClick={handleChooseFromGallery}
                  className="flex flex-col items-center gap-2 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <ImagePlus className="w-6 h-6 text-gray-700" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Galería</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  )
}