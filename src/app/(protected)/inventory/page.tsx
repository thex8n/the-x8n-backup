'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import AddProductForm from '@/components/inventory/AddProductForm'
import AddCategoryForm from '@/components/inventory/AddCategoryForm'
import EditProductForm from '@/components/inventory/EditProductForm'
import ProductList from '@/components/inventory/ProductList'
import MobileProductList from '@/components/inventory/MobileProductList'
import SearchBar from '@/components/inventory/SearchBar'
import InventoryModeSelectionModal from '@/components/inventory/InventoryModeSelectionModal'
import CategoryFilter from '@/components/inventory/CategoryFilter'
import MobileSearchHeader from '@/components/inventory/MobileSearchHeader'
import BarcodeScannerModal from '@/components/inventory/BarcodeScannerModal'
import ViewOptionsModal from '@/components/inventory/ViewOptionsModal'
import MobileCategoryBar from '@/components/inventory/MobileCategoryBar'
import { getProducts } from '@/app/actions/products'
import { getCategories } from '@/app/actions/categories'
import { ProductWithCategory } from '@/types/product'
import { Category } from '@/types/category'
import { useLoading } from '@/contexts/LoadingContext'

// Cargar ProductStats solo en el cliente para evitar problemas de hidratación con localStorage
const ProductStats = dynamic(() => import('@/components/inventory/ProductStats'), {
  ssr: false
})

interface ScannedProduct {
  id: string
  name: string
  barcode: string
  timestamp: Date
  stockBefore: number
  stockAfter: number
  imageUrl?: string | null
}

export default function InventoryPage() {
  const router = useRouter()
  const { registerLoader, unregisterLoader } = useLoading()
  const [showModeSelection, setShowModeSelection] = useState(false)
  const [showAddProductForm, setShowAddProductForm] = useState(false)
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [showViewOptions, setShowViewOptions] = useState(false)
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null)
  const [scannerHistory, setScannerHistory] = useState<ScannedProduct[]>([])
  const [comesFromScanner, setComesFromScanner] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null)
  const [allProducts, setAllProducts] = useState<ProductWithCategory[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [showStats, setShowStats] = useState(true)
  const [showCategories, setShowCategories] = useState(true)
  const [componentOrder, setComponentOrder] = useState<string[]>(['stats', 'categories'])
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si estamos en mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 🔒 PREVENIR ZOOM EN LA PÁGINA
  useEffect(() => {
    // Prevenir zoom con gestos de pellizco
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    // Prevenir zoom con doble tap
    let lastTouchEnd = 0
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }

    document.addEventListener('touchstart', preventZoom, { passive: false })
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false })

    return () => {
      document.removeEventListener('touchstart', preventZoom)
      document.removeEventListener('touchend', preventDoubleTapZoom)
    }
  }, [])

  // Leer estado de localStorage al cargar
  useEffect(() => {
    const savedShowStats = localStorage.getItem('showStats')
    if (savedShowStats !== null) {
      setShowStats(JSON.parse(savedShowStats))
    }

    const savedShowCategories = localStorage.getItem('showCategories')
    if (savedShowCategories !== null) {
      setShowCategories(JSON.parse(savedShowCategories))
    }

    const savedComponentOrder = localStorage.getItem('componentOrder')
    if (savedComponentOrder !== null) {
      setComponentOrder(JSON.parse(savedComponentOrder))
    }
  }, [])


  const loadProducts = async () => {
    const result = await getProducts()
    if ('data' in result && result.data) {
      console.log('Productos cargados:', result.data.length)
      setAllProducts(result.data)
      setFilteredProducts(result.data)
    } else {
      console.error('Error cargando productos:', result)
    }
  }

  const loadCategories = async () => {
    const result = await getCategories()
    if ('data' in result && result.data) {
      const sortedCategories = result.data.sort((a, b) => {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      })
      setCategories(sortedCategories)
    }
  }

  // Cargar productos y categorías en paralelo
  useEffect(() => {
    const loadData = async () => {
      registerLoader('inventory-page')

      try {
        await Promise.all([loadProducts(), loadCategories()])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
        unregisterLoader('inventory-page')
      }
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Calcular posiciones dinámicas basadas en el orden
  const getComponentPosition = (componentId: string): string => {
    const baseTop = 70 // Posición inicial debajo del header
    const statsHeight = 65 // Altura de ProductStats
    const categoriesHeight = 50 // Altura de MobileCategoryBar

    const visibleComponents = componentOrder.filter(id => {
      if (id === 'stats') return showStats
      if (id === 'categories') return showCategories
      return false
    })

    const index = visibleComponents.indexOf(componentId)
    if (index === -1) return `${baseTop}px`

    let topPosition = baseTop

    // Si está de primero (index === 0), subir 10px
    if (index === 0) {
      if (componentId === 'categories') topPosition -= 10
      if (componentId === 'stats') topPosition -= 10
    }

    // Si es stats y categories está visible Y es la primera (index 0), subir 17px adicionales
    if (componentId === 'stats' && showCategories && visibleComponents[0] === 'categories') {
      topPosition -= 17
    }

    for (let i = 0; i < index; i++) {
      const prevComponent = visibleComponents[i]
      if (prevComponent === 'stats') topPosition += statsHeight
      if (prevComponent === 'categories') topPosition += categoriesHeight
    }

    return `${topPosition}px`
  }

  // Calcular padding dinámico del contenedor principal
  const getContainerPaddingTop = (): number => {
    const baseTop = 70 // Altura del search header
    const statsHeight = 65
    const categoriesHeight = 50
    const spacing = 15 // Espacio constante entre componentes y productos

    const visibleComponents = componentOrder.filter(id => {
      if (id === 'stats') return showStats
      if (id === 'categories') return showCategories
      return false
    })

    // Empezar desde el search header
    let totalHeight = baseTop

    // Calcular alturas de los componentes visibles
    visibleComponents.forEach(id => {
      if (id === 'stats') totalHeight += statsHeight
      if (id === 'categories') totalHeight += categoriesHeight
    })

    // Agregar spacing constante
    totalHeight += spacing

    // Si solo categorías está seleccionada, reducir 6px
    if (showCategories && !showStats) {
      totalHeight -= 6
    }

    // Si solo estadísticas está seleccionada, aumentar 5px
    if (showStats && !showCategories) {
      totalHeight += 5
    }

    return totalHeight
  }

  const handleModeSelect = (mode: 'manual' | 'scanner') => {
    setShowModeSelection(false)
    if (mode === 'manual') {
      setScannedBarcode(null)
      setShowAddProductForm(true)
    } else if (mode === 'scanner') {
      setShowBarcodeScanner(true)
    }
  }

  const [onHistoryAddCallback, setOnHistoryAddCallback] = useState<((item: ScannedProduct) => void) | null>(null)

  const handleProductNotFound = (barcode: string, onHistoryAdd: (item: ScannedProduct) => void) => {
    setScannedBarcode(barcode)
    setOnHistoryAddCallback(() => onHistoryAdd)
    setShowAddProductForm(true)
  }

  const handleProductAdded = async (newProduct: ProductWithCategory) => {
    await loadProducts()

    const savedHistory = localStorage.getItem('scanner_history')
    let history: ScannedProduct[] = []

    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
      } catch (err) {
        console.error('Error parsing scanner history:', err)
      }
    }

    const newHistoryItem: ScannedProduct = {
      id: newProduct.id,
      name: newProduct.name,
      barcode: scannedBarcode || newProduct.barcode || '',
      timestamp: new Date(),
      stockBefore: 0,
      stockAfter: newProduct.stock_quantity,
      imageUrl: newProduct.image_url
    }

    history.unshift(newHistoryItem)

    setScannerHistory(history)
    localStorage.setItem('scanner_history', JSON.stringify(history))

    try {
      await fetch('/api/inventory-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: newProduct.id,
          product_name: newProduct.name,
          barcode: scannedBarcode || newProduct.barcode || '',
          stock_before: 0,
          stock_after: newProduct.stock_quantity,
          image_url: newProduct.image_url
        })
      })
    } catch (err) {
      console.error('Error guardando en D1:', err)
    }

    if (onHistoryAddCallback) {
      onHistoryAddCallback(newHistoryItem)
    }

    setShowAddProductForm(false)
    setScannedBarcode(null)
    setOnHistoryAddCallback(null)
  }

  const handleScannerClose = () => {
    setShowBarcodeScanner(false)
    setScannerHistory([])
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newCategories = [...categories]
    const draggedCategory = newCategories[draggedIndex]
    newCategories.splice(draggedIndex, 1)
    newCategories.splice(dropIndex, 0, draggedCategory)
    
    setCategories(newCategories)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleStatsToggle = (show: boolean) => {
    setShowStats(show)

    // Si se activa, mover al final del orden DESPUÉS de la animación
    if (show) {
      setTimeout(() => {
        const newOrder = componentOrder.filter(id => id !== 'stats')
        newOrder.push('stats')
        setComponentOrder(newOrder)
        localStorage.setItem('componentOrder', JSON.stringify(newOrder))
      }, 400) // Esperar a que termine la animación
    }
  }

  const handleCategoriesToggle = (show: boolean) => {
    setShowCategories(show)

    // Si se activa, mover al final del orden
    if (show) {
      const newOrder = componentOrder.filter(id => id !== 'categories')
      newOrder.push('categories')
      setComponentOrder(newOrder)
      localStorage.setItem('componentOrder', JSON.stringify(newOrder))
    }
  }

  return (
    <>
      <MobileSearchHeader
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onHistoryClick={() => router.push('/inventory_history')}
        onOptionsClick={() => setShowViewOptions(true)}
      />

      <div
        className="p-8 md:pt-8 md:pb-8 pb-32 transition-all duration-300 ease-out"
        style={{
          paddingTop: isMobile ? `${getContainerPaddingTop()}px` : undefined
        }}
      >
        <div className="hidden md:block mb-6 -mt-4">
          <div className="flex items-center justify-between mb-6 relative">
            <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
            <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-2xl">
              <SearchBar onSearch={handleSearch} isLoading={loading} />
            </div>
            <button
              onClick={() => setShowModeSelection(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear
            </button>
          </div>

          <div className="border-t border-gray-300 mb-6"></div>
        </div>

        <ProductStats
          products={filteredProducts}
          showStats={showStats && !showAddCategoryForm && !showAddProductForm && !editingProduct}
          isLoading={loading}
          topPosition={getComponentPosition('stats')}
        />

        <MobileCategoryBar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={handleCategoryChange}
          showCategories={showCategories && !showAddCategoryForm && !showAddProductForm && !editingProduct}
          isLoading={loading}
          onCreateNew={() => setShowAddCategoryForm(true)}
          topPosition={getComponentPosition('categories')}
        />

        <div className="hidden md:flex mb-6 items-center gap-3 flex-wrap">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategoryId === null
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          
          {categories.map((category, index) => (
            <button
              key={category.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => setSelectedCategoryId(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-move flex items-center gap-2 ${
                selectedCategoryId === category.id
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2'
              } ${draggedIndex === index ? 'opacity-50' : ''}`}
              style={
                selectedCategoryId === category.id
                  ? { backgroundColor: category.color, borderColor: category.color }
                  : { borderColor: category.color }
              }
            >
              <span className="cursor-grab active:cursor-grabbing">⋮⋮</span>
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}

          <button
            onClick={() => setShowAddCategoryForm(true)}
            className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center"
            aria-label="Crear nueva categoría"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
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
            isLoading={loading}
          />
        </div>

        <button
          onClick={() => setShowModeSelection(true)}
          className="md:hidden fixed w-16 h-16 bg-black text-white rounded-2xl shadow-2xl transition-all flex items-center justify-center z-40 active:scale-95"
          style={{
            bottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
            right: '1.5rem'
          }}
          aria-label="Crear"
        >
          <Plus className="w-10 h-10" strokeWidth={3} />
        </button>

        {showBarcodeScanner && (
          <BarcodeScannerModal
            onClose={handleScannerClose}
            onProductNotFound={handleProductNotFound}
            onStockUpdated={loadProducts}
            initialHistory={scannerHistory}
            isPaused={showAddProductForm}
          />
        )}

        {showModeSelection && (
          <InventoryModeSelectionModal
            onClose={() => setShowModeSelection(false)}
            onSelectMode={handleModeSelect}
          />
        )}

        {showViewOptions && (
          <ViewOptionsModal
            onClose={() => setShowViewOptions(false)}
            onStatsToggle={handleStatsToggle}
            showStats={showStats}
            onCategoriesToggle={handleCategoriesToggle}
            showCategories={showCategories}
          />
        )}

        {showAddProductForm && (
          <AddProductForm
            onClose={() => {
              setShowAddProductForm(false)
              setScannedBarcode(null)
            }}
            onSuccess={handleProductAdded}
            initialCode={null}
            initialBarcode={scannedBarcode}
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