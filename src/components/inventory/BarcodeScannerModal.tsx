'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X } from 'lucide-react'

interface BarcodeScannerModalProps {
  onClose: () => void
}

export default function BarcodeScannerModal({ onClose }: BarcodeScannerModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [isScannerActive, setIsScannerActive] = useState(true)
  const lastScannedRef = useRef<string | null>(null)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const scannerIdRef = useRef('barcode-scanner')

  useEffect(() => {
    if (isScannerActive) {
      startScanner()
    } else {
      stopScanner()
    }
    return () => {
      stopScanner()
    }
  }, [isScannerActive])

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode(scannerIdRef.current)
      html5QrCodeRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        { 
          fps: 25,
          disableFlip: false
        },
        (decodedText) => {
          if (decodedText !== lastScannedRef.current) {
            if (navigator.vibrate) navigator.vibrate(100)
            setScannedCode(decodedText)
            lastScannedRef.current = decodedText
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

  const handleClose = async () => {
    await stopScanner()
    onClose()
  }

  const handleUseCode = () => {
    // NO hacer nada, solo mostrar el código
    // El usuario debe cerrar manualmente con la X
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
      {scannedCode && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl z-20 shadow-2xl">
          <p className="text-lg font-bold">{scannedCode}</p>
        </div>
      )}

      {/* Sección inferior blanca */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-white rounded-t-3xl z-10 shadow-2xl">
        <div className="flex flex-col items-center justify-center h-full px-6">
          <p className="text-gray-600 text-center text-sm mb-4">
            Coloca el código de barras dentro del marco
          </p>
          {scannedCode && (
            <button
              onClick={handleUseCode}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg"
            >
              Confirmar código
            </button>
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
          <span className="text-white text-2xl font-bold">Unlock</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl z-30 shadow-2xl max-w-sm mx-4">
          <p className="text-red-600 mb-4 text-center font-semibold">{error}</p>
          <button 
            onClick={handleClose} 
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  )
}