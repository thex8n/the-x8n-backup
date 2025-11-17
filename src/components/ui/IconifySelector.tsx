'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Icon } from '@iconify/react'
import { Search, Loader2 } from 'lucide-react'
import { translateIconQuery } from '@/lib/dictionary/translateIconQuery'

interface IconifyIcon {
  icon: string
  name: string
}

interface IconifySelectorProps {
  selectedIcon: string
  onSelectIcon: (iconId: string) => void
}

export function IconifySelector({ selectedIcon, onSelectIcon }: IconifySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<IconifyIcon[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Búsqueda en API de Iconify con traducción automática
  const searchIcons = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setHasSearched(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setHasSearched(true)
    setError(null)

    try {
      // 🌐 TRADUCIR la consulta antes de buscar
      const translatedQuery = translateIconQuery(query)
      
      console.log(`🔍 Búsqueda: "${query}" → Traducido: "${translatedQuery}"`)
      
      // Buscar con la consulta traducida
      const response = await fetch(
        `https://api.iconify.design/search?query=${encodeURIComponent(translatedQuery)}&limit=999`
      )
      
      if (!response.ok) {
        throw new Error('Error al buscar iconos')
      }

      const data = await response.json() as { icons?: string[] }
      
      // La API devuelve: { icons: ['mdi:home', 'lucide:home', ...] }
      if (data.icons && Array.isArray(data.icons)) {
        const icons: IconifyIcon[] = data.icons.map((iconId: string) => ({
          icon: iconId,
          name: iconId.split(':')[1] || iconId
        }))
        setSearchResults(icons)
      } else {
        setSearchResults([])
      }
    } catch (err) {
      console.error('Error buscando iconos:', err)
      setError('Error al buscar iconos. Intenta de nuevo.')
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce de búsqueda
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchIcons(searchQuery)
    }, 400)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, searchIcons])

  const handleIconClick = (iconId: string) => {
    onSelectIcon(iconId)
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar iconos en español o inglés... (ej: casa, perro, comida)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Preview del icono seleccionado */}
      {selectedIcon && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Icon icon={selectedIcon} className="w-8 h-8 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Icono seleccionado</p>
            <p className="text-xs text-gray-600">{selectedIcon}</p>
          </div>
        </div>
      )}

      {/* Contador de resultados */}
      {hasSearched && !isLoading && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {searchResults.length > 0 
              ? `${searchResults.length} icono${searchResults.length !== 1 ? 's' : ''} encontrado${searchResults.length !== 1 ? 's' : ''}`
              : 'No se encontraron iconos'
            }
          </span>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Grid de iconos */}
      <div
        className="max-h-[400px] overflow-y-auto p-2 border border-gray-200 rounded-lg"
        style={{ scrollbarWidth: 'thin' }}
      >
        {!hasSearched && !searchQuery ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium mb-1">
              Busca iconos en español o inglés
            </p>
            <p className="text-xs text-gray-400">
              Ejemplos: casa, perro, comida, carro, teléfono
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Buscando iconos...</p>
          </div>
        ) : searchResults.length === 0 && hasSearched ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">
              No se encontraron iconos
            </p>
            <p className="text-xs text-gray-400">
              Intenta con otras palabras clave
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {searchResults.map((icon) => (
              <button
                key={icon.icon}
                type="button"
                onClick={() => handleIconClick(icon.icon)}
                className={`
                  p-3 rounded-lg transition-all flex items-center justify-center
                  hover:bg-gray-100 group relative
                  ${
                    selectedIcon === icon.icon
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'border-2 border-gray-200'
                  }
                `}
                title={icon.icon}
              >
                <Icon
                  icon={icon.icon}
                  className={`w-6 h-6 ${
                    selectedIcon === icon.icon ? 'text-blue-600' : 'text-gray-700'
                  }`}
                />

                {/* Tooltip */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {icon.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info de ayuda */}
      {!hasSearched && (
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>💡 Ahora puedes buscar en español: casa, perro, comida, etc.</p>
          <p className="text-gray-400">
            Acceso a miles de iconos con traducción automática español ↔ inglés
          </p>
        </div>
      )}
    </div>
  )
}