'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types/product'

interface ProductStatsProps {
  products: Product[]
  showStats: boolean
  isLoading?: boolean
}

export default function ProductStats({ products, showStats, isLoading = false }: ProductStatsProps) {
  const [shouldShow, setShouldShow] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [hasFinishedLoading, setHasFinishedLoading] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Detectar cuando termina la carga inicial
  useEffect(() => {
    if (!isLoading && !hasFinishedLoading) {
      setHasFinishedLoading(true)
    }
  }, [isLoading, hasFinishedLoading])

  // Sincronizar con la prop showStats cuando cambia
  useEffect(() => {
    if (isLoaded) {
      if (showStats) {
        setIsVisible(true)
        setShouldShow(true)
      } else {
        setIsVisible(false) // Trigger la animación de salida
        const timer = setTimeout(() => {
          setShouldShow(false) // Remover del DOM después de la animación
        }, 150) // Duración de la animación
        return () => clearTimeout(timer)
      }
    }
  }, [showStats, isLoaded])

  // Siempre renderizar el contenedor para evitar layout shift, pero ocultar el contenido si no está visible
  // if (!isLoaded || !isVisible) return null

  const totalProducts = products.length

  const totalRevenue = products.reduce((sum, product) => {
    const revenue = (product.sale_price || 0) * product.stock_quantity
    return sum + revenue
  }, 0)

  const totalSold = products.reduce((sum, product) => {
    return sum + product.stock_quantity
  }, 0)

  const avgMonthlySales = totalProducts > 0 ? Math.round(totalSold / totalProducts) : 0

  const lowStock = products.filter(product =>
    product.stock_quantity > 0 && product.stock_quantity <= product.minimum_stock
  ).length

  const emptyStock = products.filter(product =>
    product.stock_quantity === 0
  ).length

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value}`
  }

  const stats = [
    {
      label: 'Total de Productos',
      labelShort: 'Total',
      value: totalProducts.toLocaleString('es-CO'),
      valueCompact: totalProducts,
      change: '+3 productos',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6 md-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: 'Ingreso de Productos',
      labelShort: 'Ingreso',
      value: formatCurrency(totalRevenue),
      valueCompact: formatCompactCurrency(totalRevenue),
      change: '+9%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6 md-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Productos Vendidos',
      labelShort: 'Vendidos',
      value: totalSold.toLocaleString('es-CO'),
      valueCompact: totalSold,
      change: '+7%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6 md-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      label: 'Promedio Mensual',
      labelShort: 'Promedio',
      value: avgMonthlySales.toLocaleString('es-CO'),
      valueCompact: avgMonthlySales,
      change: '+5%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6 md-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: 'Stock Bajo',
      labelShort: 'Bajo',
      value: lowStock.toLocaleString('es-CO'),
      valueCompact: lowStock,
      alert: lowStock > 0,
      icon: (
        <svg className="w-6 h-6 md-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      label: 'Stock Vacío',
      labelShort: 'Vacío',
      value: emptyStock.toLocaleString('es-CO'),
      valueCompact: emptyStock,
      alert: emptyStock > 0,
      icon: (
        <svg className="w-6 h-6 md-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
    },
  ]

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
      `}</style>

      {/* 📱 VERSIÓN MÓVIL */}
      <div className="md:hidden">
        {shouldShow && hasFinishedLoading && (
          <div className={`fixed top-[70px] left-0 right-0 bg-white border-b border-gray-200 z-30 shadow-sm ${
            isVisible ? 'animate-slideDownFade' : 'animate-slideUpFade'
          }`}>
          <div className="flex gap-1 overflow-x-auto px-4 scrollbar-hide">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-2 min-w-[70px] shrink-0"
              >
                <div className="text-gray-600 mb-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {stat.icon.props.children}
                  </svg>
                </div>
                <p className={`text-sm font-bold leading-none mb-0.5 ${stat.alert ? 'text-red-600' : 'text-gray-900'}`}>
                  {stat.valueCompact}
                </p>
                <p className="text-[10px] text-gray-500 text-center leading-tight">
                  {stat.labelShort}
                </p>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* 💻 VERSIÓN DESKTOP */}
      {shouldShow && (
        <div className={`hidden md:flex gap-0 mb-8 overflow-x-auto scrollbar-hide ${
          isVisible ? 'animate-slideDownFade' : 'animate-slideUpFade'
        }`}>
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`flex-1 bg-white shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${index === 0 ? 'rounded-l-lg' : ''} ${index === stats.length - 1 ? 'rounded-r-lg' : ''} ${index !== 0 ? 'border-l-0' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 text-gray-600">
                {stat.icon}
              </div>
              {!stat.alert && stat.change && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  vs último mes
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
              {!stat.alert && stat.change && (
                <p className={`text-sm font-medium flex items-center gap-1 ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  )}
                  {stat.change}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </>
  )
}