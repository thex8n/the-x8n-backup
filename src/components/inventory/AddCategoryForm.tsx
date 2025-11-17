'use client'

import { useState } from 'react'
import { addCategory } from '@/app/actions/categories'
import { CategoryFormData } from '@/types/category'
import { Category } from '@/types/category'
import { IconifySelector } from '@/components/ui/IconifySelector'

interface AddCategoryFormProps {
  onClose: () => void
  onSuccess: () => void
  categories?: Category[]
}

export default function AddCategoryForm({ onClose, onSuccess, categories = [] }: AddCategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parent_category_id: null,
    color: '#000000',
    icon: 'mdi:package-variant',
    active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }

    setLoading(true)
    setError(null)

    const result = await addCategory(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onSuccess()
      onClose()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Crear Categoría</h2>
            <button
              onClick={onClose}
              className="text-black hover:text-black"
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className={labelClasses}>
                Nombre *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={inputClasses}
                placeholder="Ej: Electrónica"
              />
            </div>

            <div>
              <label htmlFor="description" className={labelClasses}>
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={inputClasses}
                placeholder="Descripción de la categoría..."
              />
            </div>

            <div>
              <label className={labelClasses}>
                Icono *
              </label>
              <IconifySelector
                selectedIcon={formData.icon}
                onSelectIcon={(iconId) => setFormData(prev => ({ ...prev, icon: iconId }))}
              />
            </div>

            <div>
              <label htmlFor="parent_category_id" className={labelClasses}>
                Categoría Padre (opcional)
              </label>
              <select
                id="parent_category_id"
                name="parent_category_id"
                value={formData.parent_category_id || ''}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="">Sin categoría padre</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700">
                Categoría Activa
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Categoría'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}