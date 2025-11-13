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

  // Cargar dimensiones de la imagen
  useEffect(() => {
    const img = new Image()
    img.src = imageUrl
    img.onload = () => {
      const container = containerRef.current
      if (!container) return

      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      const naturalWidth = img.naturalWidth
      const naturalHeight = img.naturalHeight

      // Calcular dimensiones para que la imagen quepa en el contenedor
      // Usamos contain para asegurar que siempre quepa completamente
      let displayWidth = naturalWidth
      let displayHeight = naturalHeight

      const widthRatio = containerWidth / displayWidth
      const heightRatio = containerHeight / displayHeight
      const ratio = Math.min(widthRatio, heightRatio) * 0.95 // 95% del contenedor para usar más espacio

      displayWidth = displayWidth * ratio
      displayHeight = displayHeight * ratio

      setImageDimensions({ width: displayWidth, height: displayHeight })

      // Área de crop inicial - ocupa 100% de la imagen (completamente grande)
      const initialCropSize = Math.min(displayWidth, displayHeight)

      // Calcular la posición para centrar en el contenedor
      const imgLeft = (containerWidth - displayWidth) / 2
      const imgTop = (containerHeight - displayHeight) / 2

      setCropArea({
        x: imgLeft,
        y: imgTop,
        width: initialCropSize,
        height: initialCropSize
      })
    }
  }, [imageUrl])

  // Sin zoom, la imagen se renderiza a tamaño completo
  const scaledWidth = imageDimensions.width
  const scaledHeight = imageDimensions.height

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

      // Calcular los límites de la imagen
      const containerRect = containerRef.current.getBoundingClientRect()
      const imgLeft = (containerRect.width - scaledWidth) / 2
      const imgTop = (containerRect.height - scaledHeight) / 2
      const imgRight = imgLeft + scaledWidth
      const imgBottom = imgTop + scaledHeight

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
        // Redimensionar la cuadrícula con límites
        setCropArea(prev => {
          const minSize = 100
          let newWidth = prev.width
          let newHeight = prev.height
          let newX = prev.x
          let newY = prev.y

          switch (isResizing) {
            case 'nw':
              newWidth = prev.width - deltaX
              newHeight = prev.height - deltaY
              if (newWidth >= minSize) newX = dragStart.cropX + deltaX
              if (newHeight >= minSize) newY = dragStart.cropY + deltaY
              break
            case 'ne':
              newWidth = prev.width + deltaX
              newHeight = prev.height - deltaY
              if (newHeight >= minSize) newY = dragStart.cropY + deltaY
              break
            case 'sw':
              newWidth = prev.width - deltaX
              newHeight = prev.height + deltaY
              if (newWidth >= minSize) newX = dragStart.cropX + deltaX
              break
            case 'se':
              newWidth = prev.width + deltaX
              newHeight = prev.height + deltaY
              break
          }

          // Mantener aspecto cuadrado
          let size = Math.max(minSize, Math.min(newWidth, newHeight))

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
  }, [isDragging, isResizing, dragStart, scaledWidth, scaledHeight])

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

        // Fondo blanco
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, SIZE, SIZE)

        // Calcular la escala entre el display y la imagen original
        const scaleToOriginal = image.naturalWidth / imageDimensions.width

        // Calcular la posición de la imagen en el contenedor
        const containerRect = containerRef.current.getBoundingClientRect()
        const imgLeft = (containerRect.width - scaledWidth) / 2
        const imgTop = (containerRect.height - scaledHeight) / 2

        // Calcular qué parte de la imagen está dentro del área de crop
        const cropRelativeX = (cropArea.x - imgLeft) * scaleToOriginal
        const cropRelativeY = (cropArea.y - imgTop) * scaleToOriginal
        const cropRelativeWidth = cropArea.width * scaleToOriginal
        const cropRelativeHeight = cropArea.height * scaleToOriginal

        // Aplicar rotación
        const centerX = SIZE / 2
        const centerY = SIZE / 2
        ctx.translate(centerX, centerY)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.translate(-centerX, -centerY)

        // Dibujar imagen recortada
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

        // Convertir a blob WebP
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
    setRotation((prev) => (prev + 90) % 360)
  }

  return (
    <>
      {/* Fondo negro completo */}
      <div className="fixed inset-0 bg-black z-120" />

      {/* Contenedor principal */}
      <div className="fixed inset-0 z-121 flex flex-col">
        {/* Área de imagen */}
        <div
          ref={containerRef}
          className="flex-1 relative bg-black flex items-center justify-center overflow-hidden"
        >
          {/* Imagen fija centrada */}
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

          {/* Oscurecimiento exterior */}
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

          {/* Área de recorte móvil */}
          <div
            className="absolute cursor-move touch-none"
            style={{
              left: `${cropArea.x}px`,
              top: `${cropArea.y}px`,
              width: `${cropArea.width}px`,
              height: `${cropArea.height}px`,
            }}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
            onTouchStart={(e) => handleTouchStart(e, 'move')}
          >
            {/* Cuadrícula 3x3 */}
            <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
              {/* Líneas verticales */}
              <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="white" strokeWidth="1" opacity="0.5" />
              <line x1="66.66%" y1="0" x2="66.66%" y2="100%" stroke="white" strokeWidth="1" opacity="0.5" />
              {/* Líneas horizontales */}
              <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="white" strokeWidth="1" opacity="0.5" />
              <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke="white" strokeWidth="1" opacity="0.5" />
            </svg>

            {/* Esquinas estilo WhatsApp */}
            <div className="absolute -inset-0.5 pointer-events-none">
              {/* Esquina superior izquierda */}
              <div className="absolute top-0 left-0">
                <div className="absolute top-0 left-0 w-[50px] h-[3px] bg-white" />
                <div className="absolute top-0 left-0 w-[3px] h-[50px] bg-white" />
              </div>
              {/* Esquina superior derecha */}
              <div className="absolute top-0 right-0">
                <div className="absolute top-0 right-0 w-[50px] h-[3px] bg-white" />
                <div className="absolute top-0 right-0 w-[3px] h-[50px] bg-white" />
              </div>
              {/* Esquina inferior izquierda */}
              <div className="absolute bottom-0 left-0">
                <div className="absolute bottom-0 left-0 w-[50px] h-[3px] bg-white" />
                <div className="absolute bottom-0 left-0 w-[3px] h-[50px] bg-white" />
              </div>
              {/* Esquina inferior derecha */}
              <div className="absolute bottom-0 right-0">
                <div className="absolute bottom-0 right-0 w-[50px] h-[3px] bg-white" />
                <div className="absolute bottom-0 right-0 w-[3px] h-[50px] bg-white" />
              </div>
            </div>

            {/* Handles invisibles para redimensionar */}
            <div
              className="absolute -top-6 -left-6 w-20 h-20 cursor-nw-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'nw')}
              onTouchStart={(e) => handleTouchStart(e, 'nw')}
            />
            <div
              className="absolute -top-6 -right-6 w-20 h-20 cursor-ne-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'ne')}
              onTouchStart={(e) => handleTouchStart(e, 'ne')}
            />
            <div
              className="absolute -bottom-6 -left-6 w-20 h-20 cursor-sw-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'sw')}
              onTouchStart={(e) => handleTouchStart(e, 'sw')}
            />
            <div
              className="absolute -bottom-6 -right-6 w-20 h-20 cursor-se-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'se')}
              onTouchStart={(e) => handleTouchStart(e, 'se')}
            />
          </div>
        </div>

        {/* Controles inferiores */}
        <div className="bg-black px-6 pb-6 pt-4">
          {/* Botones principales */}
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              disabled={uploading}
              className="text-white text-[17px] font-normal disabled:opacity-50 min-w-[90px] text-left"
            >
              Cancelar
            </button>

            <button
              onClick={handleRotate}
              disabled={uploading}
              className="flex items-center justify-center disabled:opacity-50"
              aria-label="Rotar 90°"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <RotateCw className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
            </button>

            <button
              onClick={handleSave}
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
