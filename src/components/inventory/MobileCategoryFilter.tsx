'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Category } from '@/types/category'
import { Plus } from 'lucide-react'
import { DynamicIcon } from '@/components/ui/DynamicIcon'

interface MobileCategoryFilterProps {
  categories: Category[]
  selectedCategoryId: string | null
  onCategoryChange: (categoryId: string | null) => void
  onCreateNew: () => void
  onExpandChange?: (isExpanded: boolean) => void
  onCategoryReorder?: (reorderedCategories: Category[]) => void
}

export default function MobileCategoryFilter({ 
  categories, 
  selectedCategoryId, 
  onCategoryChange, 
  onCreateNew,
  onExpandChange,
  onCategoryReorder
}: MobileCategoryFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dropLinePosition, setDropLinePosition] = useState<{ left: number, show: boolean }>({ left: 0, show: false })
  const [targetDropIndex, setTargetDropIndex] = useState<number | null>(null)
  const [touchStartX, setTouchStartX] = useState<number>(0)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Notificar al padre cada vez que cambia isExpanded
  useEffect(() => {
    if (onExpandChange) {
      onExpandChange(isExpanded)
    }
  }, [isExpanded, onExpandChange])

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  // Drag and Drop para Desktop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedIndex !== null && draggedIndex !== index) {
      const target = e.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      const midpoint = rect.left + rect.width / 2
      const position = e.clientX < midpoint ? rect.left : rect.right
      
      setDropLinePosition({ left: position, show: true })
      setTargetDropIndex(index)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    
    if (draggedIndex === null || targetDropIndex === null || draggedIndex === targetDropIndex) {
      setDraggedIndex(null)
      setDropLinePosition({ left: 0, show: false })
      setTargetDropIndex(null)
      return
    }

    const newCategories = [...categories]
    const draggedCategory = newCategories[draggedIndex]
    newCategories.splice(draggedIndex, 1)
    
    // Ajustar el índice si estamos moviendo hacia la izquierda
    const adjustedIndex = targetDropIndex > draggedIndex ? targetDropIndex - 1 : targetDropIndex
    newCategories.splice(adjustedIndex, 0, draggedCategory)
    
    if (onCategoryReorder) {
      onCategoryReorder(newCategories)
    }
    
    setDraggedIndex(null)
    setDropLinePosition({ left: 0, show: false })
    setTargetDropIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDropLinePosition({ left: 0, show: false })
    setTargetDropIndex(null)
  }

  // Touch events para móvil - MANTENER PRESIONADO
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0]
    setTouchStartX(touch.clientX)

    // Limpiar cualquier timer previo
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }

    // Iniciar timer de long press (500ms)
    longPressTimer.current = setTimeout(() => {
      setDraggedIndex(index)
      setIsDragging(true)
      
      // BLOQUEAR SCROLL del contenedor
      if (containerRef.current) {
        containerRef.current.style.overflowX = 'hidden'
      }
      
      // Vibración háptica si está disponible
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 500)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStartX)

    if (!isDragging) {
      // Si se mueve más de 10px antes de completar el long press, cancelar
      if (deltaX > 10 && longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
      return
    }

    // PREVENIR scroll cuando está en modo drag
    e.preventDefault()
    e.stopPropagation()
    
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    
    // Encontrar sobre qué categoría está el dedo
    if (element) {
      const button = element.closest('button[data-category-index]')
      if (button && draggedIndex !== null) {
        const index = parseInt(button.getAttribute('data-category-index') || '-1')
        if (index >= 0) {
          const rect = button.getBoundingClientRect()
          const containerRect = containerRef.current?.getBoundingClientRect()
          
          if (containerRect) {
            const midpoint = rect.left + rect.width / 2
            let lineLeft = 0
            let dropIndex = index
            
            if (touch.clientX < midpoint) {
              // Insertar ANTES de este botón
              lineLeft = rect.left - containerRect.left + (containerRef.current?.scrollLeft || 0) - 8
              dropIndex = index
            } else {
              // Insertar DESPUÉS de este botón
              lineLeft = rect.right - containerRect.left + (containerRef.current?.scrollLeft || 0) + 8
              dropIndex = index + 1
            }
            
            // Solo actualizar si es diferente a donde está actualmente
            if (dropIndex !== draggedIndex && dropIndex !== draggedIndex + 1) {
              setDropLinePosition({ left: lineLeft, show: true })
              setTargetDropIndex(dropIndex)
            } else {
              setDropLinePosition({ left: 0, show: false })
              setTargetDropIndex(null)
            }
          }
        }
      }
    }
  }

  const handleTouchEnd = () => {
    // Limpiar timer si no se completó el long press
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }

    // RESTAURAR SCROLL del contenedor
    if (containerRef.current) {
      containerRef.current.style.overflowX = 'auto'
    }

    if (isDragging && draggedIndex !== null && targetDropIndex !== null) {
      const newCategories = [...categories]
      const draggedCategory = newCategories[draggedIndex]
      
      // Remover el elemento arrastrado
      newCategories.splice(draggedIndex, 1)
      
      // Calcular el índice ajustado para la inserción
      let finalIndex = targetDropIndex
      if (targetDropIndex > draggedIndex) {
        finalIndex = targetDropIndex - 1
      }
      
      // Insertar en la nueva posición
      newCategories.splice(finalIndex, 0, draggedCategory)
      
      if (onCategoryReorder) {
        onCategoryReorder(newCategories)
      }

      // Vibración de confirmación
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }
    }

    // Resetear estados
    setDraggedIndex(null)
    setIsDragging(false)
    setTargetDropIndex(null)
    setDropLinePosition({ left: 0, show: false })
  }

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    
    // RESTAURAR SCROLL del contenedor
    if (containerRef.current) {
      containerRef.current.style.overflowX = 'auto'
    }
    
    setDraggedIndex(null)
    setIsDragging(false)
    setTargetDropIndex(null)
    setDropLinePosition({ left: 0, show: false })
  }

  const handleCategoryClick = (categoryId: string) => {
    // Solo cambiar categoría si NO está en modo drag
    if (!isDragging) {
      onCategoryChange(categoryId)
    }
  }

  return (
    <>
      {/* 📱 VERSIÓN MÓVIL ÚNICAMENTE */}
      <div className="md:hidden">
        {/* Contenedor que desaparece completamente - MISMA POSICIÓN QUE ESTADÍSTICAS */}
        <div 
          className={`fixed left-0 right-0 bg-white border-b border-gray-200 z-30 shadow-sm transition-all duration-300 ${
            isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
          }`}
          style={{ top: '100px' }}
        >
          <div 
            ref={containerRef}
            className={`flex gap-2 px-4 py-3 scrollbar-hide relative ${isDragging ? '' : 'overflow-x-auto'}`}
            style={{
              overflowX: isDragging ? 'hidden' : 'auto',
              touchAction: isDragging ? 'none' : 'auto'
            }}
          >
            {/* LÍNEA INDICADORA DE DROP */}
            {dropLinePosition.show && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-blue-500 rounded-full shadow-lg z-50 transition-all duration-100"
                style={{
                  left: `${dropLinePosition.left}px`
                }}
              >
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-md"></div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-md"></div>
              </div>
            )}

            {/* Botón "Todas" */}
            <button
              onClick={() => onCategoryChange(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategoryId === null
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              Todas
            </button>
            
            {/* Categorías con Drag & Drop */}
            {categories.map((category, index) => (
              <button
                key={category.id}
                data-category-index={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchCancel}
                onClick={() => handleCategoryClick(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-move select-none ${
                  selectedCategoryId === category.id
                    ? 'text-white'
                    : 'bg-white text-gray-700 active:bg-gray-50 border-2'
                } ${draggedIndex === index ? 'opacity-30 scale-90' : ''}`}
                style={
                  selectedCategoryId === category.id
                    ? { backgroundColor: category.color, borderColor: category.color }
                    : { borderColor: category.color }
                }
              >
                <span className="text-black text-xs">⋮⋮</span>
                <DynamicIcon iconId={category.icon} size={16} />
                <span>{category.name}</span>
              </button>
            ))}

            {/* Botón + para crear nueva categoría */}
            <button
              onClick={onCreateNew}
              className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 active:bg-gray-200 transition-colors flex items-center justify-center shrink-0"
              aria-label="Crear nueva categoría"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mensaje de ayuda cuando está arrastrando */}
        {isDragging && (
          <div 
            className="fixed left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg z-50"
            style={{ top: '50px' }}
          >
            📍 Arrastra a la nueva posición
          </div>
        )}

        {/* Botón toggle en el centro - IGUAL QUE ESTADÍSTICAS */}
        <button
          onClick={toggleExpanded}
          className={`fixed left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-300 rounded-full shadow-sm flex items-center justify-center transition-all duration-300 hover:shadow-md ${
            isExpanded ? 'w-6 h-6' : 'w-8 h-8'
          }`}
          style={{ top: isExpanded ? '160px' : '100px' }}
          aria-label={isExpanded ? "Ocultar categorías" : "Mostrar categorías"}
        >
          <svg 
            className={`text-black transition-all duration-300 ${
              isExpanded ? 'w-3 h-3 rotate-180' : 'w-4 h-4'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </>
  )
}