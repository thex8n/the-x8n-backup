'use client'

import { useState, useRef, useEffect } from 'react'
import { RotateCw } from 'lucide-react'

interface ImageCropModalProps {
  imageUrl: string
  onClose: () => void
  onCropComplete: (croppedImageBlob: Blob) => Promise<void>
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export default function ImageCropModal({ imageUrl, onClose, onCropComplete }: ImageCropModalProps) {
  const [rotation, setRotation] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 300, height: 300 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Declarar scaledWidth y scaledHeight AQUÍ ARRIBA
  const scaledWidth = imageDimensions.width
  const scaledHeight = imageDimensions.height

  // Cargar dimensiones de la imagen SOLO UNA VEZ al inicio
  useEffect(() => {
    const img = new Image()
    img.src = imageUrl
    img.onload = () => {
      const container = containerRef.current
      if (!container) return

      // Solo calcular una vez al cargar la imagen
      if (imageDimensions.width !== 0) return

      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      const naturalWidth = img.naturalWidth
      const naturalHeight = img.naturalHeight

      // Calcular dimensiones para que la imagen quepa en el contenedor
      let displayWidth = naturalWidth
      let displayHeight = naturalHeight

      const widthRatio = containerWidth / displayWidth
      const heightRatio = containerHeight / displayHeight
      
      // SIEMPRE usar el ratio que hace que quepa completa (Math.min)
      // pero con un porcentaje MÁS ALTO para usar más espacio
      let ratio = Math.min(widthRatio, heightRatio) * 0.92

      displayWidth = displayWidth * ratio
      displayHeight = displayHeight * ratio

      setImageDimensions({ width: displayWidth, height: displayHeight })

      // Calcular la posición de la imagen en el contenedor
      const imgLeft = (containerWidth - displayWidth) / 2
      const imgTop = (containerHeight - displayHeight) / 2

      // Área de crop inicial - lo más grande posible
      const initialCropSize = Math.min(displayWidth, displayHeight)

      // Centrar la cuadrícula dentro de la imagen
      const cropX = imgLeft + (displayWidth - initialCropSize) / 2
      const cropY = imgTop + (displayHeight - initialCropSize) / 2

      setCropArea({
        x: cropX,
        y: cropY,
        width: initialCropSize,
        height: initialCropSize
      })
    }
  }, [imageUrl])

  // Ajustar cuadrícula cuando gira SI se sale de los límites
  useEffect(() => {
    if (!containerRef.current || imageDimensions.width === 0) return

    const containerRect = containerRef.current.getBoundingClientRect()
    
    // Calcular límites REALES de la imagen rotada
    const normalizedRotation = rotation % 360
    let effectiveWidth = scaledWidth
    let effectiveHeight = scaledHeight
    
    // Si está rotada 90° o 270°, intercambiar dimensiones
    if (normalizedRotation === 90 || normalizedRotation === 270) {
      effectiveWidth = scaledHeight
      effectiveHeight = scaledWidth
    }
    
    const imgLeft = (containerRect.width - effectiveWidth) / 2
    const imgTop = (containerRect.height - effectiveHeight) / 2
    const imgRight = imgLeft + effectiveWidth
    const imgBottom = imgTop + effectiveHeight

    // Verificar si la cuadrícula se sale
    const isOutOfBounds =
      cropArea.x < imgLeft ||
      cropArea.y < imgTop ||
      cropArea.x + cropArea.width > imgRight ||
      cropArea.y + cropArea.height > imgBottom

    if (isOutOfBounds) {
      // Ajustar cuadrícula para que quepa
      setCropArea(prev => {
        let newWidth = prev.width
        let newHeight = prev.height
        
        // Si es más grande que la imagen, reducir
        if (newWidth > effectiveWidth || newHeight > effectiveHeight) {
          const size = Math.min(effectiveWidth, effectiveHeight)
          newWidth = size
          newHeight = size
        }
        
        // Centrar en la imagen
        const newX = imgLeft + (effectiveWidth - newWidth) / 2
        const newY = imgTop + (effectiveHeight - newHeight) / 2
        
        return {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight
        }
      })
    }
  }, [rotation, imageDimensions, scaledWidth, scaledHeight])

  // Ajustar cuadrícula cuando gira SI se sale de los límites
  useEffect(() => {
    if (!containerRef.current || imageDimensions.width === 0) return

    const containerRect = containerRef.current.getBoundingClientRect()
    
    // Calcular límites REALES de la imagen rotada
    const normalizedRotation = rotation % 360
    let effectiveWidth = imageDimensions.width
    let effectiveHeight = imageDimensions.height
    
    // Si está rotada 90° o 270°, intercambiar dimensiones
    if (normalizedRotation === 90 || normalizedRotation === 270) {
      effectiveWidth = imageDimensions.height
      effectiveHeight = imageDimensions.width
    }
    
    const imgLeft = (containerRect.width - effectiveWidth) / 2
    const imgTop = (containerRect.height - effectiveHeight) / 2
    const imgRight = imgLeft + effectiveWidth
    const imgBottom = imgTop + effectiveHeight

    // Verificar si la cuadrícula se sale
    setCropArea(prev => {
      const isOutOfBounds =
        prev.x < imgLeft ||
        prev.y < imgTop ||
        prev.x + prev.width > imgRight ||
        prev.y + prev.height > imgBottom

      if (!isOutOfBounds) {
        // Si NO se sale, no hacer nada
        return prev
      }

      // Si se sale, ajustar
      let newWidth = prev.width
      let newHeight = prev.height
      
      // Si es más grande que la imagen, reducir
      if (newWidth > effectiveWidth || newHeight > effectiveHeight) {
        const size = Math.min(effectiveWidth, effectiveHeight)
        newWidth = size
        newHeight = size
      }
      
      // Centrar en la imagen
      const newX = imgLeft + (effectiveWidth - newWidth) / 2
      const newY = imgTop + (effectiveHeight - newHeight) / 2
      
      return {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      }
    })
  }, [rotation, imageDimensions])

  const handleMouseDown = (e: React.MouseEvent, type: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (type === 'move') {
      setIsDragging(true)
    } else {
      setIsResizing(type)
    }

    setDragStart({
      x: e.clientX,
      y: e.clientY,
      cropX: cropArea.x,
      cropY: cropArea.y
    })
  }

  const handleTouchStart = (e: React.TouchEvent, type: string) => {
    e.stopPropagation()
    const touch = e.touches[0]

    if (type === 'move') {
      setIsDragging(true)
    } else {
      setIsResizing(type)
    }

    setDragStart({
      x: touch.clientX,
      y: touch.clientY,
      cropX: cropArea.x,
      cropY: cropArea.y
    })
  }

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging && !isResizing) return
      if (!containerRef.current) return

      const deltaX = clientX - dragStart.x
      const deltaY = clientY - dragStart.y

      // Calcular los límites de la imagen CONSIDERANDO LA ROTACIÓN
      const containerRect = containerRef.current.getBoundingClientRect()
      
      const normalizedRotation = rotation % 360
      let effectiveWidth = scaledWidth
      let effectiveHeight = scaledHeight
      
      // Si está rotada 90° o 270°, intercambiar dimensiones
      if (normalizedRotation === 90 || normalizedRotation === 270) {
        effectiveWidth = scaledHeight
        effectiveHeight = scaledWidth
      }
      
      const imgLeft = (containerRect.width - effectiveWidth) / 2
      const imgTop = (containerRect.height - effectiveHeight) / 2
      const imgRight = imgLeft + effectiveWidth
      const imgBottom = imgTop + effectiveHeight

      if (isDragging) {
        // Mover la cuadrícula con límites
        setCropArea(prev => {
          let newX = dragStart.cropX + deltaX
          let newY = dragStart.cropY + deltaY

          // Limitar para que no salga de la imagen
          newX = Math.max(imgLeft, Math.min(newX, imgRight - prev.width))
          newY = Math.max(imgTop, Math.min(newY, imgBottom - prev.height))

          return { ...prev, x: newX, y: newY }
        })
      } else if (isResizing) {
        // Redimensionar la cuadrícula con límites y más precisión
        setCropArea(prev => {
          const minSize = 100
          let newWidth = prev.width
          let newHeight = prev.height
          let newX = prev.x
          let newY = prev.y

          // Sensibilidad de 1px por cada 50px de movimiento
          const RESIZE_SENSITIVITY = 0.02
          const adjustedDeltaX = deltaX * RESIZE_SENSITIVITY
          const adjustedDeltaY = deltaY * RESIZE_SENSITIVITY

          switch (isResizing) {
            case 'nw':
              // Esquina superior izquierda: achica/agranda desde arriba-izquierda
              newWidth = prev.width - adjustedDeltaX
              newHeight = prev.height - adjustedDeltaY
              newX = dragStart.cropX + adjustedDeltaX
              newY = dragStart.cropY + adjustedDeltaY
              break
            case 'ne':
              // Esquina superior derecha: achica/agranda desde arriba-derecha
              newWidth = prev.width + adjustedDeltaX
              newHeight = prev.height - adjustedDeltaY
              newX = dragStart.cropX
              newY = dragStart.cropY + adjustedDeltaY
              break
            case 'sw':
              // Esquina inferior izquierda: achica/agranda desde abajo-izquierda
              newWidth = prev.width - adjustedDeltaX
              newHeight = prev.height + adjustedDeltaY
              newX = dragStart.cropX + adjustedDeltaX
              newY = dragStart.cropY
              break
            case 'se':
              // Esquina inferior derecha: achica/agranda desde abajo-derecha
              newWidth = prev.width + adjustedDeltaX
              newHeight = prev.height + adjustedDeltaY
              newX = dragStart.cropX
              newY = dragStart.cropY
              break
          }

          // Mantener aspecto cuadrado - usar el MENOR cambio para más control y suavidad
          let size = Math.min(Math.abs(newWidth), Math.abs(newHeight))
          size = Math.max(minSize, size)

          // Limitar el tamaño para que no salga de la imagen
          const maxWidthFromLeft = imgRight - newX
          const maxHeightFromTop = imgBottom - newY
          const maxWidthFromRight = prev.x + prev.width - imgLeft
          const maxHeightFromBottom = prev.y + prev.height - imgTop

          switch (isResizing) {
            case 'nw':
              size = Math.min(size, maxWidthFromRight, maxHeightFromBottom)
              // Ajustar posición si el tamaño cambió
              newX = prev.x + prev.width - size
              newY = prev.y + prev.height - size
              // Asegurar que no salga por la izquierda/arriba
              newX = Math.max(imgLeft, newX)
              newY = Math.max(imgTop, newY)
              break
            case 'ne':
              size = Math.min(size, maxWidthFromLeft, maxHeightFromBottom)
              newY = prev.y + prev.height - size
              newY = Math.max(imgTop, newY)
              break
            case 'sw':
              size = Math.min(size, maxWidthFromRight, maxHeightFromTop)
              newX = prev.x + prev.width - size
              newX = Math.max(imgLeft, newX)
              break
            case 'se':
              size = Math.min(size, maxWidthFromLeft, maxHeightFromTop)
              break
          }

          return { x: newX, y: newY, width: size, height: size }
        })
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault()
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const handleEnd = () => {
      setIsDragging(false)
      setIsResizing(null)
    }

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleEnd)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleEnd)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleEnd)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleEnd)
      }
    }
  }, [isDragging, isResizing, dragStart, scaledWidth, scaledHeight, rotation])

  const createCroppedImage = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.src = imageUrl

      image.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx || !containerRef.current) {
          reject(new Error('No se pudo crear el canvas'))
          return
        }

        const SIZE = 800
        canvas.width = SIZE
        canvas.height = SIZE

        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, SIZE, SIZE)

        const scaleToOriginal = image.naturalWidth / imageDimensions.width

        const containerRect = containerRef.current.getBoundingClientRect()
        const imgLeft = (containerRect.width - scaledWidth) / 2
        const imgTop = (containerRect.height - scaledHeight) / 2

        const cropRelativeX = (cropArea.x - imgLeft) * scaleToOriginal
        const cropRelativeY = (cropArea.y - imgTop) * scaleToOriginal
        const cropRelativeWidth = cropArea.width * scaleToOriginal
        const cropRelativeHeight = cropArea.height * scaleToOriginal

        const centerX = SIZE / 2
        const centerY = SIZE / 2
        ctx.translate(centerX, centerY)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.translate(-centerX, -centerY)

        ctx.drawImage(
          image,
          Math.max(0, cropRelativeX),
          Math.max(0, cropRelativeY),
          Math.min(cropRelativeWidth, image.naturalWidth),
          Math.min(cropRelativeHeight, image.naturalHeight),
          0,
          0,
          SIZE,
          SIZE
        )

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Error al crear imagen'))
            }
          },
          'image/webp',
          0.85
        )
      }

      image.onerror = () => reject(new Error('Error al cargar imagen'))
    })
  }

  const handleSave = async () => {
    setUploading(true)
    try {
      const croppedBlob = await createCroppedImage()
      await onCropComplete(croppedBlob)
    } catch (error) {
      console.error('Error al procesar imagen:', error)
      alert('Error al procesar la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleRotate = () => {
    setRotation((prev) => prev + 90)
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black z-120"
        onClick={(e) => e.stopPropagation()}
      />

      <div
        className="fixed inset-0 z-121 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={containerRef}
          className="flex-1 relative bg-black flex items-center justify-center overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Imagen a recortar"
            className="absolute pointer-events-none"
            style={{
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease',
              objectFit: 'contain'
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              clipPath: `polygon(
                0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
                ${cropArea.x}px ${cropArea.y}px,
                ${cropArea.x + cropArea.width}px ${cropArea.y}px,
                ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px,
                ${cropArea.x}px ${cropArea.y + cropArea.height}px,
                ${cropArea.x}px ${cropArea.y}px
              )`
            }}
          />

          <div
            className="absolute cursor-move touch-none border border-white/20"
            style={{
              left: `${cropArea.x}px`,
              top: `${cropArea.y}px`,
              width: `${cropArea.width}px`,
              height: `${cropArea.height}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
            onTouchStart={(e) => handleTouchStart(e, 'move')}
          >
            <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
              <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="white" strokeWidth="1" opacity="0.2" />
              <line x1="66.66%" y1="0" x2="66.66%" y2="100%" stroke="white" strokeWidth="1" opacity="0.2" />
              <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="white" strokeWidth="1" opacity="0.2" />
              <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke="white" strokeWidth="1" opacity="0.2" />
            </svg>

            <div className="absolute -inset-0.5 pointer-events-none">
              <div className="absolute top-0 left-0">
                <div className="absolute top-0 left-0 w-[30px] h-[3px] bg-white" />
                <div className="absolute top-0 left-0 w-[3px] h-[30px] bg-white" />
              </div>
              <div className="absolute top-0 right-0">
                <div className="absolute top-0 right-0 w-[30px] h-[3px] bg-white" />
                <div className="absolute top-0 right-0 w-[3px] h-[30px] bg-white" />
              </div>
              <div className="absolute bottom-0 left-0">
                <div className="absolute bottom-0 left-0 w-[30px] h-[3px] bg-white" />
                <div className="absolute bottom-0 left-0 w-[3px] h-[30px] bg-white" />
              </div>
              <div className="absolute bottom-0 right-0">
                <div className="absolute bottom-0 right-0 w-[30px] h-[3px] bg-white" />
                <div className="absolute bottom-0 right-0 w-[3px] h-[30px] bg-white" />
              </div>
            </div>

            <div
              className="absolute -top-4 -left-4 w-12 h-12 cursor-nw-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'nw')}
              onTouchStart={(e) => handleTouchStart(e, 'nw')}
            />
            <div
              className="absolute -top-4 -right-4 w-12 h-12 cursor-ne-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'ne')}
              onTouchStart={(e) => handleTouchStart(e, 'ne')}
            />
            <div
              className="absolute -bottom-4 -left-4 w-12 h-12 cursor-sw-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'sw')}
              onTouchStart={(e) => handleTouchStart(e, 'sw')}
            />
            <div
              className="absolute -bottom-4 -right-4 w-12 h-12 cursor-se-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'se')}
              onTouchStart={(e) => handleTouchStart(e, 'se')}
            />
          </div>
        </div>

        <div className="bg-black px-6 pb-6 pt-4">
          <div className="flex items-center justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              disabled={uploading}
              className="text-white text-[17px] font-normal disabled:opacity-50 min-w-[90px] text-left"
            >
              Cancelar
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRotate()
              }}
              disabled={uploading}
              className="flex items-center justify-center disabled:opacity-50"
              aria-label="Rotar 90°"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <RotateCw className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSave()
              }}
              disabled={uploading}
              className="text-white text-[17px] font-normal disabled:opacity-50 min-w-[90px] text-right"
            >
              {uploading ? 'Subiendo...' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}