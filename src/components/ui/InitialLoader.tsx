'use client'

import { useEffect } from 'react'
import { useLoading } from '@/contexts/LoadingContext'

export default function InitialLoader() {
  const { isGlobalLoading, setFontLoaded } = useLoading()

  useEffect(() => {
    // Esperar a que las fuentes estén cargadas
    if (typeof window !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        // Agregar un pequeño delay para suavizar la transición
        setTimeout(() => {
          setFontLoaded(true)
        }, 300)
      })
    } else {
      // Fallback si document.fonts no está disponible
      setTimeout(() => {
        setFontLoaded(true)
      }, 1000)
    }
  }, [setFontLoaded])

  if (!isGlobalLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner circular animado */}
        <div className="relative w-24 h-24">
          <div
            className="absolute inset-0 rounded-full animate-slow-spin"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, transparent 30deg, rgba(147, 197, 253, 0.3) 90deg, #93c5fd 180deg, #60a5fa 270deg, #3b82f6 360deg)'
            }}
          ></div>
          <div className="absolute inset-3 rounded-full bg-gray-50"></div>
        </div>
      </div>
    </div>
  )
}
