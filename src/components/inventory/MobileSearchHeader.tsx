'use client'

import { useState } from 'react'
import { X, ClipboardClock, Table2 } from 'lucide-react'
import { IoSearch } from "react-icons/io5"

interface MobileSearchHeaderProps {
  onSearch: (query: string) => void
  searchQuery: string
  onHistoryClick?: () => void
  onOptionsClick?: () => void
}

export default function MobileSearchHeader({ 
  onSearch, 
  searchQuery, 
  onHistoryClick,
  onOptionsClick 
}: MobileSearchHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleExpand = () => {
    setIsExpanded(true)
  }

  const handleClose = () => {
    setIsExpanded(false)
    onSearch('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value)
  }

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {!isExpanded ? (
        <div className="flex items-center justify-end gap-2 p-4">
          <button
            onClick={onOptionsClick}
            className="p-2"
            aria-label="Opciones de vista"
          >
            <Table2 className="w-6 h-6 text-black" />
          </button>
          {onHistoryClick && (
            <button
              onClick={onHistoryClick}
              className="p-2"
              aria-label="Ver historial"
            >
              <ClipboardClock className="w-6 h-6 text-black" />
            </button>
          )}
          <button
            onClick={handleExpand}
            className="p-2"
            aria-label="Abrir búsqueda"
          >
            <IoSearch className="w-6 h-6 text-black" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3">
          <div className="flex-1 relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleChange}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <button
            onClick={handleClose}
            className="p-2"
            aria-label="Cerrar búsqueda"
          >
            <X className="w-6 h-6 text-black" />
          </button>
        </div>
      )}
    </div>
  )
}