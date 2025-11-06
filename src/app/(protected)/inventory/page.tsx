'use client'

import { useState, useEffect, useCallback } from 'react'
import AddProductForm from '@/components/inventory/AddProductForm'
import AddCategoryForm from '@/components/inventory/AddCategoryForm'
import EditProductForm from '@/components/inventory/EditProductForm'
import ProductList from '@/components/inventory/ProductList'
import MobileProductList from '@/components/inventory/MobileProductList'
import ProductStats from '@/components/inventory/ProductStats'
import SearchBar from '@/components/inventory/SearchBar'
import CreateMenuModal from '@/components/inventory/CreateMenuModal'
import CategoryFilter from '@/components/inventory/CategoryFilter'
import MobileSearchHeader from '@/components/inventory/MobileSearchHeader'
import BarcodeScannerModal from '@/components/inventory/BarcodeScannerModal'
import { getProducts } from '@/app/actions/products'
import { getCategories } from '@/app/actions/categories'
import { ProductWithCategory } from '@/types/product'
import { Category } from '@/types/category'

export default function InventoryPage() {
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [showAddProductForm, setShowAddProductForm] = useState(false)
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null)
  const [allProducts, setAllProducts] = useState<ProductWithCategory[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const loadProducts = async () => {
    setLoading(true)
    const result = await getProducts()
    if ('data' in result && result.data) {
      setAllProducts(result.data)
      setFilteredProducts(result.data)
    }
    setLoading(false)
  }

  const loadCategories = async () => {
    const result = await getCategories()
    if ('data' in result && result.data) {
      setCategories(result.data)
    }
  }

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const handleSuccess = () => {
    loadProducts()
  }

  const handleCategorySuccess = () => {
    loadCategories()
    setShowAddCategoryForm(false)
  }

  const applyFilters = useCallback(() => {
    let filtered = allProducts

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.code.toLowerCase().includes(lowerQuery)
      )
    }

    if (selectedCategoryId) {
      filtered = filtered.filter(product => product.category_id === selectedCategoryId)
    }

    setFilteredProducts(filtered)
  }, [allProducts, searchQuery, selectedCategoryId])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleCategoryChange = useCallback((categoryId: string | null) => {
    setSelectedCategoryId(categoryId)
  }, [])

  const handleScanSuccess = (code: string) => {
    const existingProduct = allProducts.find(p => p.code === code)
    
    if (existingProduct) {
      setEditingProduct(existingProduct)
    } else {
      setScannedCode(code)
      setShowAddProductForm(true)
    }
  }

  return (
    <>
      <MobileSearchHeader 
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />

      <div className="md:hidden h-16"></div>

      <div className="p-8 pb-32">
        <h1 className="hidden md:block text-3xl font-bold text-gray-900 mb-6">Inventario</h1>

        <div className="hidden md:block border-t border-gray-300 mb-6"></div>

        <div className="hidden md:flex mb-6 flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <SearchBar onSearch={handleSearch} isLoading={loading} />
            <CategoryFilter
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onChange={handleCategoryChange}
            />
          </div>

          <button
            onClick={() => setShowCreateMenu(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear
          </button>
        </div>

        <div className="hidden md:block">
          <ProductStats products={filteredProducts} />
        </div>

        <div className="hidden md:block">
          <ProductList
            products={filteredProducts}
            onProductDeleted={loadProducts}
            onProductEdit={setEditingProduct}
          />
        </div>

        <div className="md:hidden">
          <MobileProductList
            products={filteredProducts}
            onProductDeleted={loadProducts}
            onProductEdit={setEditingProduct}
          />
        </div>

        <button
          onClick={() => setShowBarcodeScanner(true)}
          className="md:hidden fixed w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
          style={{ 
            bottom: '6rem',
            right: '1.5rem',
            zIndex: 40
          }}
          aria-label="Escanear código"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {showBarcodeScanner && (
          <BarcodeScannerModal
            onClose={() => setShowBarcodeScanner(false)}
            onScanSuccess={handleScanSuccess}
          />
        )}

        {showCreateMenu && (
          <CreateMenuModal
            onClose={() => setShowCreateMenu(false)}
            onSelectScanner={() => {
              setShowCreateMenu(false)
              setShowBarcodeScanner(true)
            }}
            onSelectProduct={() => {
              setShowCreateMenu(false)
              setScannedCode(null)
              setShowAddProductForm(true)
            }}
            onSelectCategory={() => {
              setShowCreateMenu(false)
              setShowAddCategoryForm(true)
            }}
          />
        )}

        {showAddProductForm && (
          <AddProductForm
            onClose={() => {
              setShowAddProductForm(false)
              setScannedCode(null)
            }}
            onSuccess={handleSuccess}
            initialCode={scannedCode}
          />
        )}

        {showAddCategoryForm && (
          <AddCategoryForm
            onClose={() => setShowAddCategoryForm(false)}
            onSuccess={handleCategorySuccess}
            categories={categories}
          />
        )}

        {editingProduct && (
          <EditProductForm
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </>
  )
}