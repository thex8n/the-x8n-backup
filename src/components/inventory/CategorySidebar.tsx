'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types/category'
import { X, Search } from 'lucide-react'

interface CategorySidebarProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  selectedCategoryId: string | null
  onCategoryChange: (categoryId: string | null) => void
}

export default function CategorySidebar({
  isOpen,
  onClose,
  categories,
  selectedCategoryId,
  onCategoryChange
}: CategorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCategories, setFilteredCategories] = useState(categories)

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

  const handleCategorySelect = (categoryId: string | null) => {
    onCategoryChange(categoryId)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        style={{ zIndex: 70 }}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ zIndex: 70 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 momo-font">Categorías</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar sidebar"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent momo-font"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="overflow-y-auto h-[calc(100%-140px)]">
          {/* Todas las categorías */}
          <button
            onClick={() => handleCategorySelect(null)}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
              selectedCategoryId === null ? 'bg-gray-50' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className={`font-medium momo-font truncate ${
                selectedCategoryId === null ? 'text-black' : 'text-gray-700'
              }`}>
                Todas las categorías
              </p>
            </div>
            {selectedCategoryId === null && (
              <div className="w-2 h-2 rounded-full bg-black" />
            )}
          </button>

          {/* Lista de categorías filtradas */}
          {filteredCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                selectedCategoryId === category.id ? 'bg-gray-50' : ''
              }`}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl border-2"
                style={{ borderColor: category.color }}
              >
                {category.icon}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className={`font-medium momo-font truncate ${
                  selectedCategoryId === category.id ? 'text-black' : 'text-gray-700'
                } ${category.name.length > 20 ? 'text-sm' : ''}`}>
                  {category.name}
                </p>
              </div>
              {selectedCategoryId === category.id && (
                <div className="w-2 h-2 rounded-full bg-black" />
              )}
            </button>
          ))}

          {/* No results */}
          {searchQuery.trim() && filteredCategories.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500 momo-font">No se encontraron categorías</p>
            </div>
          )}
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .momo-font {
          font-family: var(--font-momo-trust), sans-serif;
        }
      `}</style>
    </>
  )
}
