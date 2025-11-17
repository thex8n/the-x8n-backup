'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types/category'
import { Icon } from '@iconify/react'

interface CategorySidebarProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  selectedCategoryId: string | null
  onCategoryChange: (categoryId: string | null) => void
  onCreateCategory?: () => void
}

export default function CategorySidebar({
  isOpen,
  onClose,
  categories,
  selectedCategoryId,
  onCategoryChange,
  onCreateCategory
}: CategorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCategories, setFilteredCategories] = useState(categories)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [searchQuery, categories])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        setOpenMenuId(null)
      }
    }

    if (openMenuId) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [openMenuId])

  const handleCategorySelect = (categoryId: string | null) => {
    onCategoryChange(categoryId)
    onClose()
  }

  const handleMenuClick = (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation()
    setOpenMenuId(openMenuId === categoryId ? null : categoryId)
  }

  const handleEdit = (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation()
    console.log('Editar categoría:', categoryId)
    setOpenMenuId(null)
    // Aquí puedes agregar la lógica para editar
  }

  const handleDelete = (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation()
    console.log('Eliminar categoría:', categoryId)
    setOpenMenuId(null)
    // Aquí puedes agregar la lógica para eliminar
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .momo-font {
          font-family: var(--font-momo-trust), sans-serif;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        style={{ zIndex: 100 }}
        onClick={() => {
          if (openMenuId) {
            setOpenMenuId(null)
          } else {
            onClose()
          }
        }}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ zIndex: 101 }}
      >
        {/* Header */}
        <div className="flex items-center justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar sidebar"
          >
            <Icon icon="mdi:close" width={20} height={20} style={{ color: '#000000' }} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <div className="relative group">
            <Icon 
              icon="mdi:magnify" 
              width={20} 
              height={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black group-focus-within:scale-110 transition-all duration-300" 
            />
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent momo-font placeholder:text-gray-400 text-black transition-all duration-300"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="overflow-y-auto h-[calc(100%-140px)]">
          {/* Todas las categorías */}
          <div className="flex items-center gap-2 px-4 mb-2">
            <button
              onClick={() => handleCategorySelect(null)}
              className="flex-1 flex items-center gap-3 transition-colors rounded-lg px-2 py-2 bg-white shadow-md hover:shadow-lg"
            >
              <div className="flex-1 text-left overflow-hidden">
                <p className="font-medium momo-font truncate text-black">
                  Todas las categorías
                </p>
              </div>
              {selectedCategoryId === null && (
                <div className="w-2 h-2 rounded-full bg-black" />
              )}
            </button>
            
            <button
              onClick={onCreateCategory}
              className="w-10 h-10 bg-white text-black rounded-lg shadow-md transition-all flex items-center justify-center active:scale-95 hover:shadow-lg shrink-0"
              aria-label="Crear categoría"
            >
              <Icon icon="mdi:plus" width={20} height={20} style={{ color: '#000000' }} />
            </button>
          </div>

          {/* Lista de categorías filtradas */}
          {filteredCategories.map((category) => (
            <div key={category.id} className="px-4 mb-2 relative">
              <div className="w-full flex items-center gap-3 transition-colors rounded-lg px-2 py-2 bg-white shadow-md hover:shadow-lg">
                <button
                  onClick={() => handleCategorySelect(category.id)}
                  className="flex items-center gap-3 flex-1"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <Icon icon={category.icon} width={32} height={32} style={{ color: '#000000' }} />
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className={`font-medium momo-font truncate text-black ${category.name.length > 20 ? 'text-sm' : ''}`}>
                      {category.name}
                    </p>
                  </div>
                  {selectedCategoryId === category.id && (
                    <div className="w-2 h-2 rounded-full bg-black" />
                  )}
                </button>
                
                {/* Botón de menú (3 puntitos) */}
                <button
                  onClick={(e) => handleMenuClick(e, category.id)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Opciones de categoría"
                >
                  <Icon icon="mdi:dots-vertical" width={16} height={16} style={{ color: '#000000' }} />
                </button>
              </div>

              {/* Menú desplegable */}
              {openMenuId === category.id && (
                <div className="absolute right-4 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[120px]">
                  <button
                    onClick={(e) => handleEdit(e, category.id)}
                    className="w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-100 transition-colors momo-font"
                  >
                    Editar
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, category.id)}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 transition-colors momo-font"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* No results */}
          {searchQuery.trim() && filteredCategories.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500 momo-font">No se encontraron categorías</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}