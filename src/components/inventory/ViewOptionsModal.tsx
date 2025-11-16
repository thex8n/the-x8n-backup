'use client'

import { useEffect, useState } from 'react'
import { Tag } from 'lucide-react'
import { TbPresentationAnalytics } from "react-icons/tb"

interface ViewOptionsModalProps {
  onClose: () => void
  onStatsToggle: (show: boolean) => void
  showStats: boolean
  onCategoriesToggle: (show: boolean) => void
  showCategories: boolean
}

export default function ViewOptionsModal({ onClose, onStatsToggle, showStats, onCategoriesToggle, showCategories }: ViewOptionsModalProps) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 200)
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleStatsToggle = () => {
    const newValue = !showStats
    onStatsToggle(newValue)
    localStorage.setItem('showStats', JSON.stringify(newValue))
  }

  const handleCategoriesToggle = () => {
    const newValue = !showCategories
    onCategoriesToggle(newValue)
    localStorage.setItem('showCategories', JSON.stringify(newValue))
  }

  return (
    <>
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @keyframes slideDown {
          from { 
            transform: translateY(0);
            opacity: 1;
          }
          to { 
            transform: translateY(100%);
            opacity: 0;
          }
        }

        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes overlayFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .animate-slideUp {
          animation: slideUp 0.25s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-in forwards;
        }

        .animate-overlayFadeIn {
          animation: overlayFadeIn 0.2s ease-out;
        }

        .animate-overlayFadeOut {
          animation: overlayFadeOut 0.2s ease-out forwards;
        }
      `}</style>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-112 ${isClosing ? 'animate-overlayFadeOut' : 'animate-overlayFadeIn'}`}
        onClick={handleBackdropClick}
      />
      
      {/* Modal */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-113 shadow-2xl ${isClosing ? 'animate-slideDown' : 'animate-slideUp'}`}>
        {/* Manija superior */}
        <div className="flex justify-center pt-2 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Título */}
        <div className="px-4 pb-3">
          <h3 className="text-base font-semibold text-gray-900" style={{ fontFamily: 'MomoTrustDisplay, sans-serif' }}>Opciones de Vista</h3>
        </div>

        {/* Opciones */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Opción 1: Estadísticas (FUNCIONAL) */}
            <button
              onClick={handleStatsToggle}
              className="flex flex-col items-center gap-2 py-3 px-2 rounded-lg transition-colors"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                showStats ? 'border-[3px] border-green-500' : 'border-[3px] border-red-500'
              }`}>
                <TbPresentationAnalytics className="w-6 h-6 text-black" />
              </div>
              <span className="text-xs font-medium text-gray-900 text-center" style={{ fontFamily: 'MomoTrustDisplay, sans-serif' }}>Estadísticas</span>
            </button>

            {/* Opción 2: Categorías (SOLO VISUAL) */}
            <button
              onClick={handleCategoriesToggle}
              className="flex flex-col items-center gap-2 py-3 px-2 rounded-lg transition-colors"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                showCategories ? 'border-[3px] border-green-500' : 'border-[3px] border-red-500'
              }`}>
                <Tag className="w-6 h-6 text-black" />
              </div>
              <span className="text-xs font-medium text-gray-900 text-center" style={{ fontFamily: 'MomoTrustDisplay, sans-serif' }}>Categorías</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}