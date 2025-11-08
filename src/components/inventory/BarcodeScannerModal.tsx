'use client'

import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface BarcodeScannerModalProps {
  onClose: () => void
  onProductNotFound?: (barcode: string) => void
  onStockUpdated?: () => void
}

export default function BarcodeScannerModal({ onClose, onProductNotFound, onStockUpdated }: BarcodeScannerModalProps) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const [scannedCode, setScannedCode] = useState<string>('')
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const html5QrCodeRef = useRef<any>(null)
  const isProcessingRef = useRef<boolean>(false)
  const lastScanTimeRef = useRef<number>(0)
  const scanCountRef = useRef<number>(0)

  useEffect(() => {
    let isMounted = true

    const initScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        
        if (!isMounted || !scannerRef.current) return

        const html5QrCode = new Html5Qrcode('reader')
        html5QrCodeRef.current = html5QrCode

        const config = {
          fps: 30,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
          formatsToSupport: [
            0,  // QR_CODE
            1,  // AZTEC
            2,  // CODABAR
            3,  // CODE_39
            4,  // CODE_93
            5,  // CODE_128
            6,  // DATA_MATRIX
            7,  // MAXICODE
            8,  // ITF
            9,  // EAN_13
            10, // EAN_8
            11, // PDF_417
            12, // RSS_14
            13, // RSS_EXPANDED
            14, // UPC_A
            15, // UPC_E
            16, // UPC_EAN_EXTENSION
          ],
        }

        const qrCodeSuccessCallback = async (decodedText: string) => {
          if (isProcessingRef.current) return
          
          const now = Date.now()
          if (now - lastScanTimeRef.current < 1000) {
            console.log('Cooldown activo, esperando...')
            return
          }
          lastScanTimeRef.current = now
          
          isProcessingRef.current = true
          scanCountRef.current += 1
          setScannedCode(decodedText)
          
          if (navigator.vibrate) {
            navigator.vibrate(200)
          }

          console.log(`Código escaneado #${scanCountRef.current}:`, decodedText)
          
          await handleBarcodeScanned(decodedText)
          
          setTimeout(() => {
            isProcessingRef.current = false
            setScannedCode('')
            setMessage(null)
          }, 800)
        }

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          qrCodeSuccessCallback,
          undefined
        )

        setIsCameraReady(true)
      } catch (err) {
        console.error('Error iniciando escáner:', err)
      }
    }

    initScanner()

    return () => {
      isMounted = false
      isProcessingRef.current = false
      lastScanTimeRef.current = 0
      scanCountRef.current = 0
      
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch((err: any) => {
          console.error('Error deteniendo escáner:', err)
        })
      }
    }
  }, [])

  const handleBarcodeScanned = async (barcode: string) => {
    setIsProcessing(true)
    setMessage(null)

    try {
      // Importar las funciones de búsqueda e incremento
      const { findProductByBarcode, incrementProductStock } = await import('@/app/actions/products')

      // 1. Buscar producto por código de barras
      const findResult = await findProductByBarcode(barcode)

      if (findResult.error) {
        console.error('❌ Error buscando producto:', findResult.error)
        setMessage({
          type: 'error',
          text: `✗ Error: ${findResult.error}`
        })
        return
      }

      if (findResult.data) {
        // 2. Producto encontrado - incrementar stock
        const updateResult = await incrementProductStock(findResult.data.id)

        if (updateResult.error) {
          console.error('❌ Error actualizando stock:', updateResult.error)
          setMessage({
            type: 'error',
            text: `✗ Error actualizando: ${updateResult.error}`
          })
          return
        }

        // ✅ Stock actualizado exitosamente
        setMessage({
          type: 'success',
          text: `✓ Stock actualizado: ${updateResult.data?.name || findResult.data.name}`
        })

        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100])
        }

        if (onStockUpdated) {
          onStockUpdated()
        }
      } else {
        // ⚠ Producto no encontrado
        setMessage({
          type: 'info',
          text: '⚠ Producto no encontrado. Abriendo formulario...'
        })

        setTimeout(() => {
          if (onProductNotFound) {
            onProductNotFound(barcode)
          }
        }, 800)
      }
    } catch (error) {
      console.error('Error procesando código:', error)
      setMessage({
        type: 'error',
        text: '✗ Error al procesar el código. Intenta nuevamente.'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = async () => {
    isProcessingRef.current = false
    lastScanTimeRef.current = 0
    scanCountRef.current = 0

    // Revalidar inventario antes de cerrar
    if (scanCountRef.current > 0) {
      try {
        const { revalidateInventory } = await import('@/app/actions/products')
        await revalidateInventory()
      } catch (err) {
        console.error('Error revalidando inventario:', err)
      }
    }

    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        onClose()
      }).catch((err: any) => {
        console.error('Error al cerrar:', err)
        onClose()
      })
    } else {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 overflow-y-auto" 
      style={{ 
        zIndex: 60,
        background: 'linear-gradient(to bottom right, rgb(79, 70, 229), rgb(147, 51, 234), rgb(37, 99, 235))'
      }}
    >
      {/* Patrón de fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 grid-rows-8 sm:grid-rows-10 md:grid-rows-12 h-full w-full">
          {[...Array(96)].map((_, i) => (
            <div key={i} className="border border-white/20 rounded-lg m-0.5 sm:m-1"></div>
          ))}
        </div>
      </div>

      {/* Botón cerrar */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-1.5 sm:p-2 bg-white/90 rounded-full z-10 shadow-lg hover:bg-white transition-all"
        style={{ zIndex: 70 }}
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
      </button>

      {/* Área del escáner - Responsive */}
      <div className="absolute top-[20%] sm:top-[25%] md:top-[28%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 z-20">
        <div 
          id="reader" 
          ref={scannerRef}
          className="w-full h-full rounded-2xl overflow-hidden"
        ></div>
      </div>

      {/* Marco del escáner - Esquinas amarillas responsive */}
      <div className="absolute top-[20%] sm:top-[25%] md:top-[28%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 z-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-10 h-10 sm:w-12 sm:h-12 border-l-3 border-t-3 sm:border-l-4 sm:border-t-4 border-yellow-400 rounded-tl-2xl"></div>
        <div className="absolute top-0 right-0 w-10 h-10 sm:w-12 sm:h-12 border-r-3 border-t-3 sm:border-r-4 sm:border-t-4 border-yellow-400 rounded-tr-2xl"></div>
        <div className="absolute bottom-0 left-0 w-10 h-10 sm:w-12 sm:h-12 border-l-3 border-b-3 sm:border-l-4 sm:border-b-4 border-yellow-400 rounded-bl-2xl"></div>
        <div className="absolute bottom-0 right-0 w-10 h-10 sm:w-12 sm:h-12 border-r-3 border-b-3 sm:border-r-4 sm:border-b-4 border-yellow-400 rounded-br-2xl"></div>
      </div>

      {/* Panel inferior blanco - Responsive */}
      <div className="absolute bottom-0 left-0 right-0 h-[55vh] sm:h-96 md:h-96 bg-white rounded-t-3xl z-10 shadow-2xl">
        <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6 py-4">
          {isCameraReady && (
            <>
              {scannedCode ? (
                <div className={`border-2 rounded-xl p-4 sm:p-6 w-full max-w-sm mb-4 sm:mb-6 ${
                  message?.type === 'success' ? 'bg-green-50 border-green-500' :
                  message?.type === 'error' ? 'bg-red-50 border-red-500' :
                  message?.type === 'info' ? 'bg-blue-50 border-blue-500' :
                  'bg-green-50 border-green-500'
                }`}>
                  {isProcessing ? (
                    <div className="text-center">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 border-3 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-gray-700 text-xs sm:text-sm font-medium">Procesando...</p>
                    </div>
                  ) : message ? (
                    <>
                      <p className={`text-xs sm:text-xs font-semibold mb-2 text-center ${
                        message.type === 'success' ? 'text-green-700' :
                        message.type === 'error' ? 'text-red-700' :
                        'text-blue-700'
                      }`}>
                        {message.text}
                      </p>
                      <p className="text-gray-900 text-base sm:text-xl font-bold text-center tracking-wider break-all">
                        {scannedCode}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-green-700 text-xs font-semibold mb-2 text-center">
                        ✓ CÓDIGO ESCANEADO
                      </p>
                      <p className="text-gray-900 text-lg sm:text-2xl font-bold text-center tracking-wider break-all">
                        {scannedCode}
                      </p>
                    </>
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}