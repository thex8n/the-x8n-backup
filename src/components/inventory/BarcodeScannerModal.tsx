'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { X } from 'lucide-react'
import { findProductByBarcode, incrementProductStock } from '@/app/actions/products'

interface BarcodeScannerModalProps {
  onClose: () => void
  onProductNotFound: (barcode: string) => void
  onStockUpdated?: () => void
}

export default function BarcodeScannerModal({ onClose, onProductNotFound, onStockUpdated }: BarcodeScannerModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [isScannerActive, setIsScannerActive] = useState(true)
  const [notification, setNotification] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const lastScannedRef = useRef<string | null>(null)
  const lastScanTimeRef = useRef<number>(0)
  const scanLockRef = useRef<boolean>(false)
  const isProcessingRef = useRef<boolean>(false)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const scannerIdRef = useRef('barcode-scanner')
  const SCAN_COOLDOWN_MS = 500 // Cooldown de 500ms entre escaneos

  useEffect(() => {
    if (isScannerActive) {
      startScanner()
    } else {
      stopScanner()
    }
    return () => {
      // Cleanup completo al desmontar
      stopScanner()
      lastScannedRef.current = null
      lastScanTimeRef.current = 0
      scanLockRef.current = false
      isProcessingRef.current = false
    }
  }, [isScannerActive])

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode(scannerIdRef.current)
      html5QrCodeRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,  // Reducido a 10 FPS para mejor precisión y menos carga
          qrbox: { width: 250, height: 250 },  // Área optimizada para enfoque
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          // Protección robusta contra escaneos múltiples
          const now = Date.now()
          const timeSinceLastScan = now - lastScanTimeRef.current

          // Verificar: lock, cooldown, duplicados, y que NO esté procesando
          if (
            !scanLockRef.current &&
            !isProcessingRef.current &&
            timeSinceLastScan >= SCAN_COOLDOWN_MS &&
            decodedText !== lastScannedRef.current
          ) {
            scanLockRef.current = true
            isProcessingRef.current = true
            lastScanTimeRef.current = now
            handleBarcodeScanned(decodedText)
          }
        },
        () => {}
      )
    } catch (err) {
      setError('No se pudo acceder a la cámara')
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleBarcodeScanned = async (barcode: string) => {
    // PAUSAR SCANNER INMEDIATAMENTE
    setIsScannerActive(false)
    setIsProcessing(true)
    setScannedCode(barcode)
    lastScannedRef.current = barcode

    // Vibración inicial
    if (navigator.vibrate) navigator.vibrate(100)

    try {
      // Buscar producto por barcode
      const result = await findProductByBarcode(barcode)

      if (result.error) {
        setError(result.error)
        setIsProcessing(false)
        isProcessingRef.current = false
        scanLockRef.current = false
        setIsScannerActive(true) // Reactivar scanner en caso de error
        return
      }

      if (result.data) {
        // ✅ PRODUCTO EXISTE: Incrementar stock
        const incrementResult = await incrementProductStock(result.data.id)

        if (incrementResult.error) {
          setError(incrementResult.error)
          isProcessingRef.current = false
          scanLockRef.current = false
          setIsScannerActive(true) // Reactivar scanner en caso de error
        } else {
          // Mostrar notificación de éxito
          setNotification(`+1 ${result.data.name}`)

          // Vibración de éxito
          if (navigator.vibrate) navigator.vibrate([100, 50, 100])

          // Llamar callback para refrescar la lista de productos
          if (onStockUpdated) {
            onStockUpdated()
          }

          // Limpiar notificación y refs después de 2 segundos, luego REACTIVAR SCANNER
          setTimeout(() => {
            setNotification(null)
            setScannedCode(null)
            lastScannedRef.current = null
            scanLockRef.current = false
            isProcessingRef.current = false
            setIsScannerActive(true) // REACTIVAR SCANNER para siguiente escaneo
          }, 2000)
        }
      } else {
        // ❌ PRODUCTO NO EXISTE: Abrir formulario
        // FIX CRÍTICO: Detener COMPLETAMENTE el scanner antes de abrir formulario

        // Marcar como NO procesando para prevenir más llamadas
        isProcessingRef.current = false
        scanLockRef.current = false
        lastScannedRef.current = null

        // Detener el scanner completamente
        await stopScanner()

        // NO reactivar scanner - se queda pausado porque se abre el formulario
        // Esperar un momento para que el scanner se detenga completamente
        setTimeout(() => {
          onProductNotFound(barcode)
        }, 100)
      }
    } catch (err) {
      setError('Error al procesar el código')
      isProcessingRef.current = false
      scanLockRef.current = false
      setIsScannerActive(true) // Reactivar scanner en caso de error
    }

    setIsProcessing(false)
  }

  const handleClose = async () => {
    await stopScanner()
    onClose()
  }

  const toggleScanner = () => {
    setIsScannerActive(!isScannerActive)
  }

  return (
    <div className="fixed inset-0 bg-[linear-gradient(to_bottom_right,#4f46e5,#9333ea,#2563eb)] overflow-y-auto" style={{ zIndex: 60 }}>
      {/* Patrón de fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 grid-rows-12 h-full w-full">
          {[...Array(96)].map((_, i) => (
            <div key={i} className="border border-white/20 rounded-lg m-1"></div>
          ))}
        </div>
      </div>

      {/* Botón cerrar */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 p-2 bg-white/90 rounded-full z-10 shadow-lg hover:bg-white transition-all"
        style={{ zIndex: 70 }}
      >
        <X className="w-6 h-6 text-gray-800" />
      </button>

      {/* Área de escaneo con esquinas */}
      <div 
        onClick={toggleScanner}
        className="absolute top-[28%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 z-20 cursor-pointer"
      >
        {/* Esquina superior izquierda */}
        <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-yellow-400 rounded-tl-2xl"></div>
        
        {/* Esquina superior derecha */}
        <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-yellow-400 rounded-tr-2xl"></div>
        
        {/* Esquina inferior izquierda */}
        <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-yellow-400 rounded-bl-2xl"></div>
        
        {/* Esquina inferior derecha */}
        <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-yellow-400 rounded-br-2xl"></div>
      </div>

      {/* Código escaneado */}
      {scannedCode && !notification && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-xl z-20 shadow-2xl">
          <p className="text-lg font-bold">{scannedCode}</p>
        </div>
      )}

      {/* Notificación de éxito */}
      {notification && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl z-20 shadow-2xl animate-bounce">
          <p className="text-lg font-bold">{notification}</p>
        </div>
      )}

      {/* Sección inferior blanca */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-white rounded-t-3xl z-10 shadow-2xl">
        <div className="flex flex-col items-center justify-center h-full px-6">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 text-center text-sm">Procesando...</p>
            </div>
          ) : notification ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 font-bold text-lg mb-2">¡Stock actualizado!</p>
              <p className="text-gray-500 text-sm">Puedes seguir escaneando</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 text-center text-sm mb-2">
                Coloca el código de barras dentro del marco
              </p>
              <p className="text-gray-400 text-xs">
                FPS: 10 | Precisión Optimizada
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cámara del escáner - posicionada en el área del recuadro */}
      {isScannerActive ? (
        <div className="absolute top-[28%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 overflow-hidden rounded-2xl" style={{ zIndex: 15 }}>
          <div id={scannerIdRef.current} className="w-full h-full" />
        </div>
      ) : (
        <div className="absolute top-[28%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-black rounded-2xl flex items-center justify-center" style={{ zIndex: 15 }}>
          <span className="text-white text-2xl font-bold">Pausado</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl z-30 shadow-2xl max-w-sm mx-4">
          <p className="text-red-600 mb-4 text-center font-semibold">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setIsProcessing(false)
              lastScannedRef.current = null
              scanLockRef.current = false
              isProcessingRef.current = false
              setIsScannerActive(true) // Reactivar scanner al reintentar
            }} 
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}