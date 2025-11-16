'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types/category'
import { Plus } from 'lucide-react'
import { TiThMenu } from 'react-icons/ti'

interface MobileCategoryBarProps {
  categories: Category[]
  selectedCategoryId: string | null
  onCategoryChange: (categoryId: string | null) => void
  showCategories: boolean
  isLoading?: boolean
  onCreateNew?: () => void
  topPosition?: string
}

export default function MobileCategoryBar({
  categories,
  selectedCategoryId,
  onCategoryChange,
  showCategories,
  isLoading = false,
  onCreateNew,
  topPosition = '135px'
}: MobileCategoryBarProps) {
  const [shouldShow, setShouldShow] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [hasFinishedLoading, setHasFinishedLoading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isMenuSelected, setIsMenuSelected] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Deseleccionar el menú cuando se selecciona cualquier categoría
  useEffect(() => {
    if (selectedCategoryId !== null) {
      setIsMenuSelected(false)
    }
  }, [selectedCategoryId])

  useEffect(() => {
    if (!isLoading && !hasFinishedLoading) {
      setHasFinishedLoading(true)
    }
  }, [isLoading, hasFinishedLoading])

  useEffect(() => {
    if (isLoaded) {
      if (showCategories) {
        setIsVisible(true)
        setShouldShow(true)
      } else {
        setIsVisible(false)
        const timer = setTimeout(() => {
          setShouldShow(false)
        }, 150)
        return () => clearTimeout(timer)
      }
    }
  }, [showCategories, isLoaded])

  const zIndex = 'z-65' // Siempre por encima de stats (z-60) y header (z-50)
  const paddingTop = 'pt-2'

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const timer = setTimeout(() => {
      setDraggedIndex(index)
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 500)
    setLongPressTimer(timer)
  }

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
    setDraggedIndex(null)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIndex === null) return
  }

  return (
    <>
      <style jsx>{`
        @keyframes slideDownFade {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUpFade {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }

        .animate-slideDownFade {
          animation: slideDownFade 0.3s ease-out forwards;
        }

        .animate-slideUpFade {
          animation: slideUpFade 0.15s ease-in forwards;
        }

        .momo-font {
          font-family: var(--font-momo-trust), sans-serif;
        }
      `}</style>

      {/* 📱 VERSIÓN MÓVIL */}
      <div className="md:hidden">
        {shouldShow && hasFinishedLoading && (
          <div
            className={`fixed left-0 right-0 bg-white ${zIndex} ${
              isVisible ? 'animate-slideDownFade' : 'animate-slideUpFade'
            }`}
            style={{ top: topPosition }}
          >
            <div className={`flex gap-2 overflow-x-auto px-3 ${paddingTop} pb-2 scrollbar-hide`}>
              {/* Botón con ícono decorativo */}
              <button
                onClick={() => {
                  setIsMenuSelected(!isMenuSelected)
                  onCategoryChange(null)
                }}
                className={`px-2 py-1 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 border border-gray-100 flex items-center gap-1.5 momo-font ${
                  isMenuSelected
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-black'
                }`}
              >
                <TiThMenu className="w-5 h-5" />
              </button>

              {/* Botón "Todas" */}
              <button
                onClick={() => {
                  setIsMenuSelected(false)
                  onCategoryChange(null)
                }}
                className={`px-2 py-1 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 momo-font ${
                  selectedCategoryId === null && !isMenuSelected
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-black border border-gray-100'
                }`}
              >
                Todas
              </button>

              {/* Categorías */}
              {categories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  onTouchStart={(e) => handleTouchStart(e, index)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchMove}
                  className={`px-2 py-1 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 momo-font ${
                    draggedIndex === index ? 'opacity-50' : ''
                  } ${
                    selectedCategoryId === category.id
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-black border border-gray-100'
                  }`}
                >
                  <span>{category.name}</span>
                </button>
              ))}

              {/* Botón + para crear nueva categoría - COLOR GRIS */}
              <button
                onClick={onCreateNew}
                className="w-8 h-8 rounded-lg bg-gray-100 text-black border border-gray-100 transition-colors flex items-center justify-center shrink-0 hover:bg-gray-200"
                aria-label="Crear nueva categoría"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}