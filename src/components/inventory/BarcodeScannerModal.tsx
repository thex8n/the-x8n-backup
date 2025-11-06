'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X } from 'lucide-react'

interface BarcodeScannerModalProps {
  onClose: () => void
  onScanSuccess: (code: string) => void
}

export default function BarcodeScannerModal({ onClose, onScanSuccess }: BarcodeScannerModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const lastScannedRef = useRef<string | null>(null)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const scannerIdRef = useRef('barcode-scanner')

  useEffect(() => {
    startScanner()
    return () => {
      stopScanner()
    }
  }, [])

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

  return (
    <div className="fixed inset-0 bg-black" style={{ zIndex: 60 }}>
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 p-2 bg-white rounded-full z-10"
        style={{ zIndex: 70 }}
      >
        <X className="w-6 h-6" />
      </button>

      <div className="absolute inset-0 bg-black bg-opacity-80 z-10" style={{ 
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, calc(50% - 144px) calc(50% - 144px), calc(50% - 144px) calc(50% + 144px), calc(50% + 144px) calc(50% + 144px), calc(50% + 144px) calc(50% - 144px), calc(50% - 144px) calc(50% - 144px))'
      }}></div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 border-2 border-white rounded-3xl pointer-events-none z-20"></div>

      {scannedCode && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg z-20 shadow-lg">
          <p className="text-lg font-bold">{scannedCode}</p>
        </div>
      )}

      {error ? (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg z-30 shadow-xl">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={handleClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Cerrar
          </button>
        </div>
      ) : (
        <div id={scannerIdRef.current} className="w-full h-full" />
      )}
    </div>
  )
}